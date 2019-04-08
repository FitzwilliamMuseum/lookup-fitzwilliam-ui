/*
 Utility actions
  */

function goToSpanHref() {
  // make span elements with a href property act like a links
  var url = $(this).attr("href");
  if (url.length > 0) {
    window.location.href = url.toString();
  }
  return false;
}

function goToOptionHref() {
  // where options of a select have href attached to them
  // go there when they get selected
  var url = $(this)
    .find(":selected")
    .attr("href");
  if (url && url.length > 0) {
    window.location.href = url.toString();
  }
  return false;
}

function buildListPerson(person, cls) {
  // construct a link to a person for a dropdown menu or list
  return $("<a>", {
    href: "/people/" + person.crsid,
    class: cls + " person-list d-flex",
    tabindex: 0
  })
    .append(
      $("<div>", { class: "thumbnail-container-sm mr-2" }).append(
        person.thumbnail
          ? $("<img>", {
              class: "thumbnail-image-sm rounded",
              src: "data:image/png;base64, " + person.thumbnail
            })
          : $("<span>", { class: "fas fa-user-astronaut thumbnail-image-sm" })
      )
    )
    .append(
      $("<div>", { class: "w-100 d-flex justify-content-between" })
        .append(
          $("<span>", {
            class: "mr-3 text-dark",
            text: person.display_name
          })
        )
        .append(
          $("<code>", {
            class: "text-danger",
            text: person.crsid
          })
        )
    );
}

function renderPerson(person) {
  return $("<a>", {
    href: "/people/" + person.crsid,
    class: "card list-group-item text-dark"
  })
    .append(
      $("<div>", {
        class: "d-flex justify-content-between card-title"
      })
        .append(
          $("<span>", {
            class: "mr-3",
            text: person.display_name
          })
        )
        .append(
          $("<code>", {
            class: "text-danger",
            text: person.crsid
          })
        )
    )
    .append(
      $("<div>", {
        class: "d-flex card-text"
      })
        .append(
          person.thumbnail
            ? $("<div>", {
                class: "thumbnail-container text-center align-middle mr-2"
              }).append(
                $("<img>", {
                  class: "thumbnail-image rounded",
                  src: "data:image/png;base64, " + person.thumbnail
                })
              )
            : null
        )
        .append(
          $("<div>")
            .append(
              person.tags.map(function(tag) {
                return $("<span>", {
                  class: "badge badge-tag mr-1",
                  "data-tag": tag.name,
                  href: "/tags/" + tag.name + "/people/",
                  text: tag.name,
                  title: tag.description
                }).on("click", goToSpanHref);
              })
            )
            .append(
              person.rooms.map(function(room) {
                return $("<span>", {
                  class: "badge badge-room mr-1",
                  "data-item": JSON.stringify(room),
                  href: "/rooms/" + room.identifier + "/",
                  text: room.building
                    ? room.building + " - " + room.number
                    : room.number,
                  title: room.description
                }).on("click", goToSpanHref);
              })
            )
        )
    );
}

function buildListAddRoom(room) {
  return $("<a>", {
    href: "#",
    class: "dropdown-item d-flex justify-content-between",
    tabindex: 0,
    "data-item": JSON.stringify(room)
  })
    .on("click", addRoom)
    .append(
      $("<button>", {
        type: "button",
        class: "mr-3 btn btn-room",
        text: room.building ? room.building + " - " + room.number : room.number,
        title: room.description
      })
    )
    .append(
      $("<small>", {
        text: room.description
      })
    );
}

function buildListRoom(room) {
  return $("<a>", {
    href: "/rooms/" + room.identifier + "/",
    class: "dropdown-item d-flex justify-content-between",
    tabindex: 0,
    "data-item": JSON.stringify(room)
  })
    .append(
      $("<button>", {
        type: "button",
        class: "mr-3 btn btn-room",
        text: room.building ? room.building + " - " + room.number : room.number,
        title: room.description
      })
    )
    .append(
      $("<small>", {
        text: room.description
      })
    );
}

function buildListAddTag(tag) {
  return $("<a>", {
    href: "#",
    class: "dropdown-item d-flex justify-content-between",
    tabindex: 0,
    "data-tag": tag.name
  })
    .on("click", addTag)
    .append(
      $("<button>", {
        type: "button",
        class: "mr-3 btn btn-tag",
        text: tag.name,
        title: tag.description
      })
    )
    .append(
      $("<small>", {
        text: tag.description
      })
    );
}

function buildListTag(tag) {
  return $("<a>", {
    href: "/tags/" + tag.name + "/people/",
    class: "dropdown-item d-flex justify-content-between",
    tabindex: 0,
    "data-tag": tag.name
  })
    .append(
      $("<button>", {
        type: "button",
        class: "mr-3 btn btn-tag",
        text: tag.name,
        title: tag.description
      })
    )
    .append(
      $("<small>", {
        text: tag.description
      })
    );
}

// click becomes delete for tag in edit mode
// otherwise just click
function tagAction() {
  var mode = $(this).data("mode");
  if (mode === "edit") {
    // delete tag
    var crsid = $("#person-info").data("crsid");
    var tag = $(this); // scoped
    $.ajax({
      type: "DELETE",
      url: "/api/people/" + crsid + "/tags/",
      data: JSON.stringify([tag.data("tag")]),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        tag.remove();
      },
      error: function(e) {
        console.log(e);
      }
    });
    return false; // prevent click going to href
  } else {
    return true; // default action go to href
  }
}

// click becomes delete for manager in edit mode
// otherwise just click
function managerAction() {
  var mode = $(this).data("mode");
  if (mode === "edit") {
    // delete manager
    var crsid = $("#person-info").data("crsid");
    var manager = $(this); // scoped
    $.ajax({
      type: "DELETE",
      url: "/api/people/" + crsid + "/line_managers/",
      data: JSON.stringify([manager.data("crsid")]),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        manager.remove();
      },
      error: function(e) {
        console.log(e);
      }
    });
    return false; // prevent click going to href
  } else {
    return true; // default action go to href
  }
}

// click becomes delete for subordinate in edit mode
// otherwise just click
function subordinateAction() {
  var mode = $(this).data("mode");
  if (mode === "edit") {
    // delete subordinate
    var crsid = $("#person-info").data("crsid");
    var subordinate = $(this); // scoped
    $.ajax({
      type: "DELETE",
      url: "/api/people/" + crsid + "/subordinates/",
      data: JSON.stringify([subordinate.data("crsid")]),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        subordinate.remove();
      },
      error: function(e) {
        console.log(e);
      }
    });
    return false; // prevent click going to href
  } else {
    return true; // default action go to href
  }
}

// click becomes delete for room in edit mode
// otherwise just click
function roomAction() {
  var mode = $(this).data("mode");
  if (mode === "edit") {
    // delete room
    var crsid = $("#person-info").data("crsid");
    var room = $(this); // scoped
    $.ajax({
      type: "DELETE",
      url: "/api/people/" + crsid + "/rooms/",
      data: JSON.stringify([room.data("item")]),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        room.remove();
      },
      error: function(e) {
        console.log(e);
      }
    });
    return false; // prevent click going to href
  } else {
    return true; // default action go to href
  }
}

// click becomes delete in edit mode
function listItemAction() {
  var mode = $(this).data("mode");
  var pList = $(this).closest(".multi-property-list");
  var attr = pList.data("attr");
  var item = $(this).data("item");
  var elem = $(this);
  if (mode === "edit") {
    // delete item
    var crsid = $("#person-info").data("crsid");
    $.ajax({
      type: "DELETE",
      url: "/api/people/" + crsid + "/" + attr + "/",
      data: JSON.stringify([item]),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        elem.parent().remove(); // inside a <p>
      }
    });
  } else {
    return true;
  }
}

function resetAddButton() {
  var btn = $(this)
    .parent()
    .find("button");
  btn
    .text("Add")
    .addClass("btn-success")
    .removeClass("btn-outline-secondary text-success");
}

// add creates item and adds it to view
function addListItem() {
  var btn = $(this);
  var crsid = $("#person-info").data("crsid");
  var pList = $(this).closest(".multi-property-list");
  var attr = pList.data("attr");
  var field = pList.data("field");
  var descField = pList.data("desc-field");
  var special = pList.data("special");
  var attrInput = $("#add-" + attr + "-" + field);
  var formElem = $(this).closest("form");
  var data = {}; // object that is sent to the api
  data[field] = attrInput.val();
  // empty, do nothing
  if (data[field].length === 0) {
    return false;
  }
  if (descField !== undefined) {
    data[descField] = $("#add-" + attr + "-" + descField).val();
  }
  $.ajax({
    type: "PATCH",
    url: "/api/people/" + crsid + "/" + attr + "/",
    data: JSON.stringify([data]),
    contentType: "application/json",
    dataType: "json",
    success: function(values) {
      // only add tags that are not already there
      var existingItems = pList
        .find(".multi-attribute")
        .map(function() {
          return $(this).data("item").identifier;
        })
        .get();
      values.forEach(function(value) {
        if ($.inArray(value.identifier, existingItems) === -1) {
          // new item
          if (special === "email") {
            $("<p>")
              .append(
                $("<span>", {
                  class: "multi-attribute",
                  "data-mode": "edit",
                  "data-item": JSON.stringify(value)
                })
                  .on("click", listItemAction)
                  .append(
                    $("<a>", {
                      href: "mailto:" + value[field],
                      title: "Compose email in default mail client",
                      text: " " + value[field] + " "
                    })
                  )
                  .append(
                    $("<a>", {
                      href:
                        "https://webmail.hermes.cam.ac.uk/?_task=mail&_action=compose&_to=" +
                        value[field],
                      title: "Compose new email in Hermes Webmail",
                      target: "_blank",
                      text: " ✉ "
                    })
                  )
                  .append(
                    $("<a>", {
                      href:
                        "https://outlook.office.com/owa/?path=/mail/action/compose&to=" +
                        value[field],
                      title: "Compose new email in Exchange Online",
                      target: "_blank"
                    }).append($("<span>", { class: "owa-logo", text: " " }))
                  )
                  .append(
                    descField !== undefined && value[descField].length !== 0
                      ? " (" + value[descField] + ") "
                      : " "
                  )
                  .append($("<span>", { class: "edit far fa-trash-alt ml-2" }))
              )
              .insertBefore(formElem);
          } else {
            $("<p>")
              .append(
                $("<span>", {
                  class: "multi-attribute",
                  "data-mode": "edit",
                  "data-item": JSON.stringify(value),
                  text:
                    descField !== undefined && value[descField].length !== 0
                      ? value[field] + " (" + value[descField] + ")"
                      : value[field] + " "
                })
                  .on("click", listItemAction)
                  .append($("<span>", { class: "edit far fa-trash-alt ml-2" }))
              )
              .insertBefore(formElem);
          }
        }
      });
      attrInput.val("");
      if (descField !== undefined) {
        data[descField] = $("#add-" + attr + "-" + descField).val("");
      }
      attrInput.focus(); // don't stay in the description field
      btn
        .removeClass("btn-success")
        .text("Added ✔")
        .addClass("btn-outline-secondary text-success");
    }
  });
  return false;
}

function addTag() {
  var crsid = $("#person-info").data("crsid");
  var tag = $(this); // scoped
  var tag_name = tag.data("tag");
  $.ajax({
    type: "POST",
    url: "/api/people/" + crsid + "/tags/",
    data: JSON.stringify([tag_name]),
    contentType: "application/json",
    dataType: "json",
    success: function(tags) {
      // only add tags that are not already there
      var existingTags = $("#personal-tags ul a.tag")
        .map(function() {
          return $(this).data("tag");
        })
        .get();
      tags.data.forEach(function(tag) {
        if ($.inArray(tag.name, existingTags) === -1) {
          // new tag
          $("<a>", {
            href: "/tags/" + tag.name + "/people/",
            class: "list-inline-item btn btn-tag my-2 tag",
            "data-tag": tag.name,
            text: tag.name,
            "data-mode": "edit",
            title: tag.description
          })
            .on("click", tagAction)
            .append($("<span>", { class: "far fa-trash-alt ml-2" }))
            .insertBefore($("#tag-quick-search"));
        }
      });
    },
    error: function(e) {
      console.log(e);
    }
  });
  return false;
}

function addTagInline() {
  // Add a tag to logged in user from the 👤+ button
  var btn = $(this); // scoped
  var container = btn.parent();
  var crsid = btn.data("user");
  var tag = btn.data("tag");
  $.ajax({
    type: "POST",
    url: "/api/people/" + crsid + "/tags/",
    data: JSON.stringify([tag]),
    contentType: "application/json",
    dataType: "json",
    success: function(tags) {
      // delete button if tag has been added
      if (
        $.inArray(
          tag,
          $.map(tags.data, function(elem) {
            return elem.name;
          })
        ) > -1
      ) {
        btn
          .removeClass("text-muted fas fa-user-plus")
          .addClass("text-success")
          .text("✔");
        setTimeout(function() {
          if (container.hasClass("hidden-interact-popup")) {
            container.remove();
          } else {
            btn.remove();
          }
        }, 3000);
      }
    },
    error: function(e) {
      console.log(e);
    }
  });
  return false;
}

function addRoomInline() {
  // Add a room to logged in user from the 👤+ button
  var btn = $(this); // scoped
  var crsid = btn.data("user");
  var roomIdentifier = btn.data("room-identifier");
  $.ajax({
    type: "PATCH",
    url: "/api/people/" + crsid + "/rooms/",
    data: JSON.stringify([{ identifier: roomIdentifier }]),
    contentType: "application/json",
    dataType: "json",
    success: function(rooms) {
      // delete button if tag has been added
      if (
        $.inArray(
          roomIdentifier,
          $.map(rooms, function(elem) {
            return elem.identifier;
          })
        ) > -1
      ) {
        btn
          .removeClass("text-muted fas fa-user-plus")
          .addClass("text-success")
          .text("✔");
        setTimeout(function() {
          btn.remove();
        }, 3000);
      }
    },
    error: function(e) {
      console.log(e);
    }
  });
  return false;
}

// add creates item and adds it to view
function addRoom() {
  var crsid = $("#person-info").data("crsid");
  var room = $(this); // scoped
  var roomList = $("#room-list");
  var data = { identifier: room.data("item").identifier }; // the room
  $.ajax({
    type: "PATCH",
    url: "/api/people/" + crsid + "/rooms/",
    data: JSON.stringify([data]),
    contentType: "application/json",
    dataType: "json",
    success: function(new_rooms) {
      // only add rooms that are not already there
      var existingRooms = roomList
        .find(".room")
        .map(function() {
          return $(this).data("item").identifier;
        })
        .get();
      new_rooms.forEach(function(new_room) {
        if ($.inArray(new_room.identifier, existingRooms) === -1) {
          // new item
          var text = new_room.number;
          if (new_room.building) {
            text = new_room.building + " - " + new_room.number;
          }
          $("<a>", {
            href: "/rooms/" + new_room.identifier + "/",
            class: "list-inline-item btn btn-room room my-1",
            "data-mode": "edit",
            "data-item": JSON.stringify(new_room),
            text: text,
            title: new_room.description
          })
            .on("click", roomAction)
            .append($("<span>", { class: "edit far fa-trash-alt ml-2" }))
            .insertBefore($("#room-quick-search"));
        }
      });
    }
  });
  return false;
}

function addManager() {
  var crsid = $("#person-info").data("crsid");
  var manager = $(this); // scoped
  var manager_crsid = manager.data("crsid");
  $.ajax({
    type: "PATCH",
    url: "/api/people/" + crsid + "/line_managers/",
    data: JSON.stringify([manager_crsid]),
    contentType: "application/json",
    dataType: "json",
    success: function(managers) {
      // only add tags that are not already there
      var existingManagers = $("#line-managers a.manager")
        .map(function() {
          return $(this).data("crsid");
        })
        .get();
      managers.forEach(function(new_manager) {
        if ($.inArray(new_manager.crsid, existingManagers) === -1) {
          // new tag
          $("<a>", {
            href: "/people/" + new_manager.crsid + "/",
            class: "list-inline-item btn btn-primary manager my-1",
            "data-crsid": new_manager.crsid,
            text: new_manager.display_name,
            "data-mode": "edit"
          })
            .on("click", managerAction)
            .append($("<span>", { class: "far fa-trash-alt ml-2" }))
            .insertBefore($("#manager-quick-search"));
        }
      });
      $("#manager-quick-search-input")
        .val("")
        .trigger("input");
    },
    error: function(e) {
      console.log(e);
    }
  });
  return false;
}

function addSubordinate() {
  var crsid = $("#person-info").data("crsid");
  var subordinate = $(this); // scoped
  var subordinate_crsid = subordinate.data("crsid");
  $.ajax({
    type: "PATCH",
    url: "/api/people/" + crsid + "/subordinates/",
    data: JSON.stringify([subordinate_crsid]),
    contentType: "application/json",
    dataType: "json",
    success: function(subordinates) {
      // only add tags that are not already there
      var existingSubordinates = $("#subordinates a.subordinate")
        .map(function() {
          return $(this).data("crsid");
        })
        .get();
      subordinates.forEach(function(new_subordinate) {
        if ($.inArray(new_subordinate.crsid, existingSubordinates) === -1) {
          // new tag
          $("<a>", {
            href: "/people/" + new_subordinate.crsid + "/",
            class: "list-inline-item btn btn-primary subordinate my-1",
            "data-crsid": new_subordinate.crsid,
            text: new_subordinate.display_name,
            "data-mode": "edit"
          })
            .on("click", subordinateAction)
            .append($("<span>", { class: "far fa-trash-alt ml-2" }))
            .insertBefore($("#subordinate-quick-search"));
        }
      });
      $("#subordinate-quick-search-input")
        .val("")
        .trigger("input");
    },
    error: function(e) {
      console.log(e);
    }
  });
  return false;
}

function resetSubmitButton() {
  var btn = $(this)
    .parent()
    .find("button");
  btn
    .text("Update")
    .addClass("btn-success")
    .removeClass("btn-outline-secondary text-success");
}

function updateField() {
  var btn = $(this);
  var personInfo = $("#person-info");
  var tagInfo = $("#tag-info");
  var roomInfo = $("#room-info");
  var newData = {};
  if (personInfo.length) {
    // text info for a person
    var crsid = personInfo.data("crsid");
    var attr = $(this)
      .closest(".single-value-property")
      .data("attr");
    newData[attr] = $("#input-" + attr).val();
    $.ajax({
      type: "PATCH",
      url: "/api/people/" + crsid + "/",
      data: JSON.stringify(newData),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        btn
          .removeClass("btn-success")
          .text("Updated ✔")
          .addClass("btn-outline-secondary text-success");
      }
    });
  } else if (tagInfo.length) {
    // Edit tag in tag view page
    var tagName = tagInfo.data("tag").name;
    newData["name"] = tagInfo
      .find("a")
      .text()
      .trim();
    newData["description"] = tagInfo.find("input").val();
    $.ajax({
      type: "PATCH",
      url: "/api/tags/" + tagName,
      data: JSON.stringify(newData),
      contentType: "application/json",
      dataType: "json",
      success: function(response) {
        if (response.name !== tagName) {
          // tag has been updated! Redirect to new version
          window.location.href = decodeURI(window.location).replace(
            "tags/" + decodeURIComponent(tagName),
            "tags/" + response.name
          );
        }
        btn
          .removeClass("btn-success")
          .text("Updated ✔")
          .addClass("btn-outline-secondary text-success");
      },
      error: function(response) {
        if (response.status === 409) {
          // Tag with this name already exists
          // pop up a warning that disappears when edited
          var tagBtn = tagInfo.find("a");
          var errorBox = $("<div>", { class: "position-absolute" })
            .append(
              $("<span>", {
                class: "badge badge-danger",
                text: "Tag name already exists!"
              })
            )
            .css({ top: "-1.2em", left: "-1em" });
          // sits above the tag box
          tagBtn.before(errorBox);
          tagBtn.removeClass("btn-tag").addClass("btn-danger");
          tagBtn.on("input", function() {
            tagBtn.removeClass("btn-danger").addClass("btn-tag");
            errorBox.remove();
          });
        }
      }
    });
  } else if (roomInfo.length) {
    // Edit room in room view page
    var oldData = roomInfo.data("room");
    newData["building"] = $("#room-building-select").val();
    newData["number"] = $("#room-number-input").val();
    newData["description"] = $("#input-room-description").val();
    $.ajax({
      type: "PATCH",
      url: "/api/rooms/" + oldData.identifier,
      data: JSON.stringify(newData),
      contentType: "application/json",
      dataType: "json",
      success: function(response) {
        if (
          response.building !== oldData.building ||
          response.number !== oldData.number
        ) {
          // forced reload to re-apply disabled state
          window.location.reload(true);
        } else {
          btn
            .removeClass("btn-success")
            .text("Updated ✔")
            .addClass("btn-outline-secondary text-success");
        }
      }
    });
  }
  return false; // preventDefault
}

function btnToggle() {
  var crsid = $("#person-info").data("crsid");
  var btn = $(this);
  var sList = btn.closest(".select-value-property");
  var attr = sList.data("attr");
  var field = sList.data("field");
  var linkedService = sList.data("linked-service");
  var data = {};
  var method = "PATCH"; // boolean toggle
  var url = "/api/people/" + crsid + "/";
  if (field) {
    // multi value toggles
    data[field] = btn.val();
    data = [data];
    url += attr + "/";
    if (btn.is(":checked")) {
      method = "PATCH"; // has become checked
    } else {
      method = "DELETE"; // remove if has been unchecked
    }
  } else if (linkedService) {
    data[attr] = btn.is(":checked");
    url += "linked_services/" + linkedService + "/";
  } else {
    data[attr] = btn.is(":checked");
  }
  $.ajax({
    type: method,
    url: url,
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    error: function() {
      // Undo change of state
      btn.prop("checked", !btn.prop("checked"));
    }
  });
}

function sessionLogout() {
  // Deactivate a session using the API method
  var btn = $(this);
  var key = btn.data("session-key");
  var sessionDiv = btn.closest("div.active-session");
  $.ajax({
    type: "DELETE",
    url: "/api/sessions/" + key,
    dataType: "json",
    success: function() {
      if (btn.data("this-session")) {
        // active token, will need to re-login to do anything
        // so go to home
        window.location.href = "/";
      } else {
        // gone, remove from the list
        sessionDiv.remove();
      }
    }
  });
}

function apiKeyGenerate() {
  // the `new` route generates a new api key then redirects
  // to it's page, which returns the information. Generate
  // a new line using the returned info.
  $.ajax({
    type: "GET",
    url: "/api/sessions/new",
    dataType: "json",
    success: function(res) {
      var newKey = $("<div>", { class: "d-flex active-session" })
        .append(
          $("<div>", { class: "mx-2" }).append($("<code>", { text: res.key }))
        )
        .append($("<div>", { class: "mx-2", text: "New!" }))
        .append(
          $("<div>", { class: "mx-2" }).append(
            $("<a>", {
              href: "#",
              class: "badge badge-danger session-logout",
              title: "logout session",
              "data-session-key": res.key,
              text: "logout"
            }).on("click", sessionLogout)
          )
        );
      // place at the top since most recent first
      $("#api-keys").prepend(newKey);
    }
  });
}

function newProfile() {
  var crsid = $("#person-info").data("crsid");
  var btn = $(this);
  var data = { crsid: crsid };
  if (btn.val() === "import") {
    data["import_ldap"] = true;
  }
  $.ajax({
    type: "POST",
    url: "/api/people/",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function() {
      window.location.reload();
    },
    statusCode: {
      403: function() {
        alert("Profiles are only available for members of Physics.");
      },
      400: function() {
        alert(
          "Error encountered creating a new entry. Does this person exist?"
        );
      }
    }
  });
}

// get suggested tags on-demand
function tagSuggest() {
  // Create a random selection of suggested tags that might be relevant
  var crsid = $("#person-info").data("crsid");
  var output = $("#tag-suggestions");
  $.ajax({
    type: "GET",
    url: "/api/people/" + crsid + "/suggested_tags/",
    data: { limit: 10, sort: "weighted-random" },
    contentType: "application/json",
    success: function(response) {
      output.empty();
      output.append(
        $("<h6>", { class: "list-inline-item", text: "Suggested tags" })
      );
      response["data"].forEach(function(tag) {
        output.append(
          $("<span>", {
            class: "list-inline-item btn btn-outline-tag my-2 tag",
            text: tag.name,
            title: tag.description,
            "data-tag": tag.name
          })
            .append($("<span>", { class: "fas fa-user-plus ml-2" }))
            .on("click", function() {
              // addTag method works fine since we set data-tag
              addTag.apply(this);
              // but we must remove this element once we're done with it
              this.remove();
            })
        );
      });
    },
    error: function(err) {
      console.log(err);
    }
  });
}

// tag cloud - get ranked list of tags from ajax and
// add to the DOM
function tagCloud(id) {
  if ($(id).length) {
    $.ajax({
      type: "GET",
      url: "/api/tags/",
      data: {
        sort: "count",
        limit: 24
      },
      dataType: "json",
      success: function(tags) {
        tags.data.forEach(function(tag) {
          $(id).append(
            $("<div>", {
              class: "col-lg-3 col-md-4 col-sm-6 col-xs-2 p-1 text-center"
            }).append(
              $("<a>", {
                class: "btn btn-tag",
                href: "/tags/" + tag.name + "/people/",
                text: tag.name
              }).append(
                $("<span>", {
                  class: "ml-3 badge badge-secondary",
                  text: tag.count
                })
              )
            )
          );
        });
      },
      error: function(data) {
        console.log(data);
      }
    });
  }
}

jQuery.fn.extend({
  addLookup: function(query) {
    // find how many results we'd get from lookup and
    // append to an element. Add to an existing list.
    var currentList = $(this);
    $.ajax({
      type: "GET",
      url: "/api/people/",
      dataType: "json",
      data: {
        query: query,
        format: "json"
      },
      success: function(result) {
        var resultCount = parseInt(result.result.value);
        var text = "No results found at lookup.cam.ac.uk";
        if (resultCount === 1) {
          text = "See " + resultCount + " result at lookup.cam";
        } else if (resultCount > 1) {
          text = "See " + resultCount + " results at lookup.cam";
        }
        currentList.append(
          $("<a>", {
            href: "https://www.lookup.cam.ac.uk/search?query=" + query,
            target: "_blank",
            class: "list-group-item text-info text-center",
            text: text
          })
        );
      },
      error: function(error) {
        console.log(error);
      }
    });
  }
});

// textarea resizing to fit contents
jQuery.fn.extend({
  autoHeight: function() {
    function autoHeight_(element) {
      return jQuery(element)
        .css({ height: "auto", "overflow-y": "hidden" })
        .height(
          element.scrollHeight + parseInt(jQuery(element).css("fontSize"))
        );
    }
    return this.each(function() {
      autoHeight_(this).on("input auto:resize", function() {
        autoHeight_(this);
      });
    });
  }
});

// document loaded - preventDefault
$(function() {
  // search people
  $("#quick-search").on("input", function() {
    var query = $("#quick-search").val();
    if (query.length === 0) {
      // hide dropdown box completely
      $("#quick-search-output").removeClass("show");
      return;
    }
    // update where "return" sends us
    $("#quick-search-form").attr("action", "/people+tags/");
    $.ajax({
      type: "GET",
      url: "/api/people/",
      data: {
        query: query,
        limit: 10,
        fuzzy: true,
        full: false // to get names and CRSid
      },
      dataType: "json",
      success: function(people) {
        var peopleList = $("<div>", {
          class: "dropdown-menu dropdown-menu-right show",
          id: "quick-search-output" // replacing this element
        });
        if (people.data.length === 0) {
          // no results
          peopleList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item person-list",
              text: "No results!"
            })
          );
        } else if (people.data.length === 1) {
          peopleList.append(buildListPerson(people.data[0], "dropdown-item"));
          // go to person page on submit if only one result,
          // otherwise go to search page
          $("#quick-search-form").attr(
            "action",
            "/people/" + people.data[0].crsid
          );
        } else {
          // build a list of all the people found
          people.data.forEach(function(person) {
            peopleList.append(buildListPerson(person, "dropdown-item"));
          });
        }
        if ($("#quick-search").val() === query) {
          $("#quick-search-output").replaceWith(peopleList);
          // append tags
          $.ajax({
            type: "GET",
            url: "/api/tags/",
            data: {
              query: query,
              limit: 6,
              sort: "count" // count doesn't include tags with 0
            },
            dataType: "json",
            success: function(tags) {
              var tagList = $("<div>", {
                class: "dropdown-item text-center",
                id: "quick-search-tag-results"
              });
              if (tags.data.length !== 0) {
                // do nothing if empty
                tags.data.forEach(function(tag, idx) {
                  if (idx > 0 && idx % 2 === 0) {
                    tagList.append($("<br>"));
                  }
                  tagList.append(
                    $("<a>", {
                      class: "btn btn-tag m-1",
                      href: "/tags/" + tag.name + "/people/",
                      text: tag.name
                    }).append(
                      $("<span>", {
                        class: "ml-2 badge badge-secondary",
                        text: tag.count
                      })
                    )
                  );
                });
                peopleList.append(tagList);
              }
            }
          });
        }
      },
      error: function(data) {
        console.log(data); // ajax failed
      }
    });
  });

  // search for everything
  $("#omni-search").on("input", function() {
    var query = $("#omni-search").val();
    if (query.length === 0) {
      // hide results box completely
      $("#omni-search-output").empty();
      // Reset button
      $("#omni-search-submit")
        .addClass("disabled")
        .text("Search");
      return;
    }
    // update where "return" sends us
    $("#omni-search-form").attr("action", "/people+tags/");
    $.ajax({
      type: "GET",
      url: "/api/people/",
      data: {
        query: query,
        limit: 10,
        fuzzy: true,
        full: false // to get names and CRSid
      },
      dataType: "json",
      success: function(people) {
        var peopleList = $("<div>", {
          class: "list-group mb-3",
          id: "omni-search-output" // replacing this element
        });
        if (people.data.length === 0) {
          // no results
          $("#omni-search-submit")
            .addClass("disabled")
            .text("Search");
          peopleList.append(
            $("<a>", {
              href: "#",
              class: "list-group-item person-list text-dark text-center",
              text: "No people found!"
            })
          );
        } else if (people.data.length === 1) {
          $("#omni-search-submit")
            .removeClass("disabled")
            .text("Go");
          peopleList.append(renderPerson(people.data[0]));
          // go to person page on submit if only one result,
          // otherwise go to search page
          $("#omni-search-form").attr(
            "action",
            "/people/" + people.data[0].crsid
          );
        } else {
          // build a list of all the people found
          $("#omni-search-submit")
            .removeClass("disabled")
            .text("Search");
          people.data.forEach(function(person) {
            peopleList.append(buildListPerson(person, "list-group-item"));
          });
          peopleList.append(
            $("<a>", {
              href: "/people/?fuzzy=true&query=" + query,
              class: "list-group-item text-info text-center",
              text: "See all " + people.meta.total + " results"
            })
          );
        }
        if ($("#omni-search").val() === query) {
          // check that results are still relevant
          $("#omni-search-output").replaceWith(peopleList);
          // prepend tags
          $.ajax({
            type: "GET",
            url: "/api/tags/",
            data: {
              query: query,
              limit: 10,
              sort: "count" // count doesn't include tags with 0
            },
            dataType: "json",
            success: function(tags) {
              var tagList = $("<div>", {
                class: "list-group-item text-center",
                id: "omni-search-tag-results"
              });
              if (tags.data.length !== 0) {
                // do nothing if empty
                tags.data.forEach(function(tag) {
                  tagList.append(
                    $("<a>", {
                      class: "btn btn-tag m-1",
                      href: "/tags/" + tag.name + "/people/",
                      text: tag.name
                    }).append(
                      $("<span>", {
                        class: "ml-2 badge badge-secondary",
                        text: tag.count
                      })
                    )
                  );
                });
                peopleList.prepend(tagList);
              }
            }
          });

          if (query.length >= 2) {
            // no results if less than two characters
            peopleList.addLookup(query);
          }
        }
      },
      error: function(data) {
        console.log(data); // ajax failed
      }
    });
  });

  // search for tags
  $("#tag-search").on("input", function() {
    var query = $("#tag-search").val();
    if (query.length === 0) {
      // hide results box completely
      $("#tag-search-output")
        .removeClass("show")
        .empty();
      // Reset button
      $("#tag-search-submit")
        .addClass("disabled")
        .text("Search");
      return;
    }
    // update where "return" sends us
    $("#tag-search-form").attr("action", "/tags/");
    $.ajax({
      type: "GET",
      url: "/api/tags/",
      data: {
        query: query,
        limit: 10,
        full: false // to get names and CRSid
      },
      dataType: "json",
      success: function(tags) {
        var tagList = $("<div>", {
          class: "dropdown-menu show",
          id: "tag-search-output" // replacing this element
        });
        if (tags.data.length === 0) {
          // no results
          $("#tag-search-submit")
            .addClass("disabled")
            .text("Search");
          tagList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item text-dark",
              text: "No results!"
            })
          );
        } else if (tags.data.length === 1) {
          $("#tag-search-submit")
            .removeClass("disabled")
            .text("Go");
          tagList.append(buildListTag(tags.data[0]));
          // go to tag page on submit if only one result,
          // otherwise go to search page
          $("#tag-search-form").attr(
            "action",
            "/tags/" + tags.data[0].name + "/people/"
          );
        } else {
          // build a list of all the tags found
          $("#tag-search-submit")
            .removeClass("disabled")
            .text("Search");
          tags.data.forEach(function(tag) {
            tagList.append(buildListTag(tag));
          });
          tagList.append(
            $("<a>", {
              href: "/tags/?query=" + query,
              class: "dropdown-item text-info text-center",
              text: "See all " + tags.meta.total + " results"
            })
          );
        }
        if ($("#tag-search").val() === query) {
          // check that results are still relevant
          $("#tag-search-output").replaceWith(tagList);
        }
      },
      error: function(data) {
        console.log(data); // ajax failed
      }
    });
  });

  // quick search for rooms
  $("#room-search").on("input", function() {
    var query = $("#room-search").val();
    if (query.length === 0) {
      // hide results box completely
      $("#room-search-output")
        .removeClass("show")
        .empty();
      // Reset button
      $("#room-search-submit")
        .addClass("disabled")
        .text("Search");
      return;
    }
    // update where "return" sends us
    $("#room-search-form").attr("action", "/rooms/");
    $.ajax({
      type: "GET",
      url: "/api/rooms/",
      data: {
        query: query,
        limit: 10,
        full: false // to get names and CRSid
      },
      dataType: "json",
      success: function(rooms) {
        var roomList = $("<div>", {
          class: "dropdown-menu show",
          id: "room-search-output" // replacing this element
        });
        if (rooms.data.length === 0) {
          // no results
          $("#room-search-submit")
            .addClass("disabled")
            .text("Search");
          roomList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item text-dark",
              text: "No results!"
            })
          );
        } else if (rooms.data.length === 1) {
          $("#room-search-submit")
            .removeClass("disabled")
            .text("Go");
          roomList.append(buildListRoom(rooms.data[0]));
          // go to room page on submit if only one result,
          // otherwise go to search page
          $("#room-search-form").attr(
            "action",
            "/rooms/" + rooms.data[0].identifier
          );
        } else {
          // build a list of all the rooms found
          $("#room-search-submit")
            .removeClass("disabled")
            .text("Search");
          rooms.data.forEach(function(room) {
            roomList.append(buildListRoom(room));
          });
          roomList.append(
            $("<a>", {
              href: "/rooms/?query=" + query,
              class: "dropdown-item text-info text-center",
              text: "See all " + rooms.meta.total + " results"
            })
          );
        }
        if ($("#room-search").val() === query) {
          // check that results are still relevant
          $("#room-search-output").replaceWith(roomList);
        }
      },
      error: function(data) {
        console.log(data); // ajax failed
      }
    });
  });

  $("#room-building-select").on("change", function() {
    // Trigger an update of search list when changing building
    // for the search line only
    $("#room-quick-search-input").trigger("input");
  });

  $("#room-quick-search-input").on("input focus", function() {
    var query = $(this).val();
    var buildingInput = $("#room-building-select");
    var selectedBuilding;
    var queryUrl = "/api/rooms/";
    var queryData = { query: query, limit: 10 };
    // hide dropdown box completely if nothing to do
    if (query.length === 0) {
      $("#room-quick-search-output").removeClass("show");
      return;
    }
    // check if we are searching within a building
    if (buildingInput.prop("selectedIndex") > 0) {
      // jquery returns text if value is not set
      // have to ensure we use a selected one.
      selectedBuilding = buildingInput.val();
      queryUrl = "/api/buildings/" + selectedBuilding + "/rooms/";
    }
    $.ajax({
      type: "GET",
      url: queryUrl,
      data: queryData,
      dataType: "json",
      success: function(rooms) {
        var roomList = $("<div>", {
          class: "dropdown-menu show",
          id: "room-quick-search-output" // replacing this element
        });
        if (rooms.data.length === 0) {
          roomList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item",
              text: "No results! Create a new room?"
            })
          );
        } else {
          rooms.data.forEach(function(room) {
            roomList.append(buildListAddRoom(room));
          });
        }
        // Build the "form" to create a new room
        var newRoomBox = $("<div>", {
          class: "dropdown-item mt-3",
          id: "new-room-edit"
        })
          .append(
            $("<div>", { class: "input-group my-1" })
              .append(
                $("<select>", {
                  class: "custom-select custom-room",
                  placeholder: "Tag",
                  id: "new-room-building-select"
                })
                  .on("change", function() {
                    // keep other select in sync
                    var selectedIndex = $(this).prop("selectedIndex");
                    $("#room-building-select").prop(
                      "selectedIndex",
                      selectedIndex
                    );
                    // clear any warning if a room is now selected
                    if (selectedIndex > 0) {
                      $(this)
                        .removeClass("custom-danger")
                        .addClass("custom-room");
                    }
                  })
                  // copy the list of rooms from the other select
                  .append(buildingInput.clone().children())
                  // manually set the selected item (not included with clone)
                  .prop("selectedIndex", buildingInput.prop("selectedIndex"))
              )
              .append(
                $("<input>", {
                  class: "form-control custom-room",
                  title: "new-room-number",
                  placeholder: "Room Number",
                  name: "number",
                  id: "new-room-number",
                  value: query
                }).on("input", function() {
                  // copy value from search
                  $("#room-quick-search-input").val(this.value);
                })
              )
          )
          .append(
            $("<div>", { class: "input-group my-1" })
              .append(
                $("<input>", {
                  class: "form-control",
                  placeholder: "Description",
                  id: "new-room-description"
                })
              )
              .append(
                $("<div>", { class: "input-group-append" }).append(
                  $("<button>", {
                    class: "btn btn-outline-room text-secondary",
                    text: "New Room"
                  }).on("click", function() {
                    // Create a new room and add it to the list
                    var newRoomBuildingSelect = $("#new-room-building-select");
                    if (newRoomBuildingSelect.prop("selectedIndex") === 0) {
                      // Building has not been selected
                      // required to make a new room so
                      // alert the user
                      newRoomBuildingSelect
                        .removeClass("custom-room")
                        .addClass("custom-danger");
                      return;
                    }
                    var room_building = newRoomBuildingSelect.val();
                    var room_number = $("#new-room-number").val();
                    var room_desc = $("#new-room-description").val();
                    $.ajax({
                      type: "POST",
                      url: "/api/rooms/",
                      data: JSON.stringify([
                        {
                          building: room_building,
                          number: room_number,
                          description: room_desc
                        }
                      ]),
                      dataType: "json",
                      contentType: "application/json",
                      success: function(data) {
                        if (data.length === 1) {
                          // defer adding to the addRoom function
                          $("<div>")
                            .data("item", data[0])
                            .on("once", addRoom)
                            .trigger("once");
                          $("#room-quick-search-input")
                            .val("")
                            .trigger("input");
                        }
                      },
                      error: function(e) {
                        console.log(e);
                      }
                    });
                  })
                )
              )
          );
        roomList.append(newRoomBox);
        $("#room-quick-search-output").replaceWith(roomList);
        // check bounding box and reposition if necessary
        if (roomList[0].getBoundingClientRect().right > window.innerWidth) {
          roomList.addClass("dropdown-menu-right");
        }
      },
      error: function(data) {
        console.log(data);
      }
    });
  });

  $("#tag-quick-search-input").on("input", function() {
    var query = $(this).val();
    if (query.length === 0) {
      // hide dropdown box completely
      $("#tag-quick-search-output").removeClass("show");
      return;
    }
    $.ajax({
      type: "GET",
      url: "/api/tags/",
      data: {
        query: query,
        limit: 10,
        sort: "name" // count doesn't include tags with 0
      },
      dataType: "json",
      success: function(tags) {
        var tagList = $("<div>", {
          class: "dropdown-menu show",
          id: "tag-quick-search-output" // replacing this element
        });
        if (tags.data.length === 0) {
          tagList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item",
              text: "No results! Create a new tag?"
            })
          );
        } else {
          tags.data.forEach(function(tag) {
            tagList.append(buildListAddTag(tag));
          });
        }
        var newTagBox = $("<div>", {
          class: "dropdown-item input-group",
          id: "new-tag-edit"
        })
          .append(
            $("<input>", {
              class: "form-control badge-tag",
              placeholder: "Tag",
              id: "new-tag-tag",
              value: query
            }).on("input", function() {
              $("#tag-quick-search-input").val(this.value);
            })
          )
          .append(
            $("<input>", {
              class: "form-control",
              placeholder: "Description",
              id: "new-tag-description"
            })
          )
          .append(
            $("<div>", { class: "input-group-append" }).append(
              $("<button>", {
                class: "btn btn-outline-tag",
                text: "New Tag"
              }).on("click", function() {
                // Create a new tag and add it to the list
                var tag_name = $("#new-tag-tag").val();
                var tag_desc = $("#new-tag-description").val();
                $.ajax({
                  type: "POST",
                  url: "/api/tags/",
                  data: JSON.stringify([
                    { name: tag_name, description: tag_desc }
                  ]),
                  dataType: "json",
                  contentType: "application/json",
                  success: function(data) {
                    if (data.length === 1) {
                      $("<div>", { "data-tag": data[0].name })
                        .on("once", addTag)
                        .trigger("once");
                      $("#tag-quick-search-input")
                        .val("")
                        .trigger("input");
                    }
                  },
                  error: function(e) {
                    console.log(e);
                  }
                });
              })
            )
          );
        tagList.append(newTagBox);
        $("#tag-quick-search-output").replaceWith(tagList);
        // check bounding box and reposition if necessary
        if (tagList[0].getBoundingClientRect().right > window.innerWidth) {
          tagList.addClass("dropdown-menu-right");
        }
      },
      error: function(data) {
        console.log(data);
      }
    });
  });

  // manager search
  $("#manager-quick-search-input").on("input", function() {
    var query = $(this).val();
    if (query.length === 0) {
      // hide dropdown box completely
      $("#manager-quick-search-output").removeClass("show");
      return;
    }
    $.ajax({
      type: "GET",
      url: "/api/people/",
      data: {
        query: query,
        limit: 10,
        fuzzy: true,
        full: false
      },
      dataType: "json",
      success: function(people) {
        var peopleList = $("<div>", {
          class: "dropdown-menu show",
          id: "manager-quick-search-output" // replacing this element
        });
        if (people.data.length === 0) {
          peopleList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item",
              text: "No results!"
            })
          );
        } else {
          people.data.forEach(function(person) {
            peopleList.append(
              buildListPerson(person, "dropdown-item")
                .on("click", addManager)
                .data("crsid", person.crsid)
            );
          });
        }
        $("#manager-quick-search-output").replaceWith(peopleList);
      },
      error: function(data) {
        console.log(data);
      }
    });
  });

  // subordinate search
  $("#subordinate-quick-search-input").on("input", function() {
    var query = $(this).val();
    if (query.length === 0) {
      // hide dropdown box completely
      $("#subordinate-quick-search-output").removeClass("show");
      return;
    }
    $.ajax({
      type: "GET",
      url: "/api/people/",
      data: {
        query: query,
        limit: 10,
        fuzzy: true,
        full: false
      },
      dataType: "json",
      success: function(people) {
        var peopleList = $("<div>", {
          class: "dropdown-menu show",
          id: "subordinate-quick-search-output" // replacing this element
        });
        if (people.data.length === 0) {
          peopleList.append(
            $("<a>", {
              href: "#",
              class: "dropdown-item",
              text: "No results!"
            })
          );
        } else {
          people.data.forEach(function(person) {
            peopleList.append(
              buildListPerson(person, "dropdown-item")
                .on("click", addSubordinate)
                .data("crsid", person.crsid)
            );
          });
        }
        $("#subordinate-quick-search-output").replaceWith(peopleList);
      },
      error: function(data) {
        console.log(data);
      }
    });
  });

  // render markdown
  // renderer for when javascript is blocked; pass text
  var md = {
    render: function(text) {
      return $("<pre>").text(text);
    }
  };
  try {
    md = markdownit({
      linkify: true,
      typographer: true
    });
  } catch (e) {
    if (e instanceof ReferenceError) {
      console.log("Unable to load markdown library");
    } else {
      console.log("Encountered unknown error loading markdown library");
    }
  }

  $("div.markdown")
    .on("markdown:refresh", function() {
      var attr = $(this).data("attr");
      $("#rendered-" + attr).html(md.render($("#input-" + attr).val()));
    })
    .trigger("markdown:refresh");

  $("#edit-toggle").on("click", function() {
    var editBtn = $(this);
    if (editBtn.data("mode") === "view") {
      // activate controls -> change to edit mode
      $("[data-mode]")
        .not("[data-mode='fixed']") // no updates to non editable fields
        .attr("data-mode", "edit")
        .data("mode", "edit")
        .prop("readonly", false)
        .filter(":checkbox")
        .prop("disabled", false);
      // enable editable fields
      $(".content-editable").prop("contenteditable", true);
      $(".disable-able").prop("disabled", false);
      $("textarea").trigger("auto:resize");
      editBtn.removeClass("text-muted");
      tagSuggest();
    } else {
      // deactivate controls -> change to view mode
      $("#tag-quick-search-input")
        .val("")
        .trigger("input"); // clear search box
      $("div.markdown").trigger("markdown:refresh");
      $("[data-mode]")
        .not("[data-mode='fixed']") // no updates to non editable fields
        .attr("data-mode", "view")
        .data("mode", "view")
        .prop("readonly", true)
        .filter(":checkbox") // disable checkboxes only
        .prop("disabled", true);
      // enable editable fields
      $(".content-editable").prop("contenteditable", false);
      $(".disable-able").prop("disabled", true);
      editBtn.addClass("");
    }
  });

  // custom file doesn't update; https://github.com/twbs/bootstrap/issues/23994
  $(".custom-file-input").on("change", function() {
    var fileName = $(this)
      .val()
      .split("\\")
      .pop();
    $(this)
      .siblings(".custom-file-label")
      .addClass("selected")
      .html(fileName);
  });

  $("#photo-upload")
    .on("drag dragstart dragend dragover dragenter dragleave drop", function(
      event
    ) {
      event.preventDefault();
      event.stopPropagation();
    })
    .on("drop", function(event) {
      if ($("#photo").data("mode") === "view") {
        return false;
      }
      this.droppedFiles = event.originalEvent.dataTransfer.files;
      $(this).trigger("submit");
    })
    .on("submit", function(evt) {
      evt.preventDefault();
      var reader = new FileReader();
      reader.onload = function() {
        var crsid = $("#person-info").data("crsid");
        var photoData = {};
        photoData["photo"] = this.result.split(",")[1];
        $.ajax({
          url: "/api/people/" + crsid + "/",
          type: "PATCH",
          data: JSON.stringify(photoData),
          contentType: "application/json",
          dataType: "json",
          success: function(person) {
            $("#person-photo").attr(
              "src",
              "data:image/jpeg;base64, " + person.photo
            );
          }
        });
      };
      var inputPhoto = undefined;
      if (this.droppedFiles) {
        inputPhoto = this.droppedFiles[0];
      } else {
        inputPhoto = $("#photo-upload-input")[0].files[0];
      }
      reader.readAsDataURL(inputPhoto);
      this.droppedFiles = undefined;
    });

  // Expand an element to be the size of the contents
  $(".xpander")
    .on("input", function() {
      var txtBox = $("<span>", { class: "px-3" })
        .css({
          "font-family": $(this).css("font-family"),
          "font-size": $(this).css("font-size"),
          "font-weight": $(this).css("font-weight"),
          visibility: "hidden",
          "white-space": "pre"
        })
        .insertBefore($(this));
      txtBox.text($(this).val() || $(this).prop("placeholder"));
      $(this).css("max-width", txtBox.outerWidth());
      txtBox.remove();
    })
    .trigger("input");

  // delete a room
  $("#delete-room-btn").on("click", function() {
    var doubleCheck = confirm(
      "Are you sure you would like to delete this room?"
    );
    if (doubleCheck === true) {
      var identifier = $(this).data("identifier");
      $.ajax({
        url: "/api/rooms/" + identifier,
        type: "DELETE",
        dataType: "json",
        success: function(room) {
          alert("Deleted room: " + JSON.stringify(room));
          window.location.href = "/rooms/";
        }
      });
    }
  });

  // links within links
  $("span[href]").on("click", goToSpanHref);

  // links in a select
  $(".select-href").on("change", goToOptionHref);

  // make tags editable
  $("#personal-tags ul a").on("click", tagAction);

  $("#line-managers ul a").on("click", managerAction);

  $("#subordinates ul a").on("click", subordinateAction);

  $("#room-list ul a").on("click", roomAction);

  // single value fields change button appearance on edit and submit
  $(".editable-field input, .editable-field textarea").on(
    "input",
    resetSubmitButton
  );
  $(".editable-field button").on("click", updateField);

  $(".multi-attribute").on("click", listItemAction);

  // multiple value fields
  $(".btn-add-attr").on("click", addListItem);
  $("div.add-attr input").on("input", resetAddButton);

  $("input.toggle").on("change", btnToggle);

  $(".new-profile").on("click", newProfile);

  $(".add-user-tag").on("click", addTagInline);

  $(".add-user-room").on("click", addRoomInline);

  $(".session-logout").on("click", sessionLogout);

  $(".api-key-generate").on("click", apiKeyGenerate);

  $("textarea").autoHeight();

  // generate a tag cloud
  tagCloud("#tag-cloud");
});
