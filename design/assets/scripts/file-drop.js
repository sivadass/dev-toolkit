(function () {
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function isMultiple(root, input) {
    return root.getAttribute("data-multiple") === "true" || input.multiple;
  }

  function revokeThumbs(list) {
    list.querySelectorAll("img[data-object-url]").forEach(function (img) {
      URL.revokeObjectURL(img.getAttribute("data-object-url"));
    });
  }

  function render(root, idle, list, files) {
    revokeThumbs(list);
    list.innerHTML = "";

    if (!files.length) {
      root.classList.remove("has-files");
      idle.hidden = false;
      list.hidden = true;
      return;
    }

    root.classList.add("has-files");
    idle.hidden = true;
    list.hidden = false;

    files.forEach(function (file, index) {
      var li = document.createElement("li");
      li.className = "file-drop__chip";

      var thumb = document.createElement("div");
      thumb.className = "file-drop__thumb";

      if (file.type.indexOf("image/") === 0) {
        var url = URL.createObjectURL(file);
        var img = document.createElement("img");
        img.src = url;
        img.alt = "";
        img.setAttribute("data-object-url", url);
        thumb.appendChild(img);
      } else {
        var icon = document.createElement("span");
        icon.className = "material-symbols-rounded";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "draft";
        thumb.appendChild(icon);
      }

      var meta = document.createElement("div");
      meta.className = "file-drop__meta";

      var name = document.createElement("p");
      name.className = "file-drop__name";
      name.textContent = file.name;

      var size = document.createElement("p");
      size.className = "file-drop__size";
      size.textContent = formatSize(file.size);

      meta.appendChild(name);
      meta.appendChild(size);

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "file-drop__remove";
      remove.setAttribute("aria-label", "Remove " + file.name);
      remove.innerHTML =
        '<span class="material-symbols-rounded" aria-hidden="true">close</span>';
      remove.addEventListener("click", function () {
        files.splice(index, 1);
        syncInput(root, files);
        render(root, idle, list, files);
      });

      li.appendChild(thumb);
      li.appendChild(meta);
      li.appendChild(remove);
      list.appendChild(li);
    });
  }

  function syncInput(root, files) {
    var input = root.querySelector(".file-drop__input");
    if (!input) return;
    try {
      var dt = new DataTransfer();
      files.forEach(function (f) {
        dt.items.add(f);
      });
      input.files = dt.files;
    } catch (err) {
      /* DataTransfer assignment unsupported — UI still works */
    }
  }

  function addFiles(root, idle, list, files, incoming) {
    var input = root.querySelector(".file-drop__input");
    var multiple = isMultiple(root, input);
    var next = multiple
      ? files.concat(Array.prototype.slice.call(incoming))
      : [incoming[0]].filter(Boolean);
    files.length = 0;
    next.forEach(function (f) {
      files.push(f);
    });
    syncInput(root, files);
    render(root, idle, list, files);
  }

  function initRoot(root) {
    var input = root.querySelector(".file-drop__input");
    var idle = root.querySelector("[data-file-drop-idle]");
    var list = root.querySelector("[data-file-drop-list]");
    if (!input || !idle || !list) return;

    if (root.getAttribute("data-multiple") === "true") {
      input.multiple = true;
    }

    var files = [];
    var dragDepth = 0;

    ["dragenter", "dragover", "dragleave", "drop"].forEach(function (type) {
      root.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    root.addEventListener("dragenter", function () {
      dragDepth += 1;
      root.classList.add("is-dragging");
    });

    root.addEventListener("dragleave", function () {
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        root.classList.remove("is-dragging");
      }
    });

    root.addEventListener("drop", function (event) {
      dragDepth = 0;
      root.classList.remove("is-dragging");
      var dropped = event.dataTransfer && event.dataTransfer.files;
      if (dropped && dropped.length) {
        addFiles(root, idle, list, files, dropped);
      }
    });

    input.addEventListener("change", function () {
      if (input.files && input.files.length) {
        addFiles(root, idle, list, files, input.files);
      }
    });
  }

  function initFileDrops() {
    document.querySelectorAll("[data-file-drop]").forEach(initRoot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFileDrops);
  } else {
    initFileDrops();
  }
})();
