const contextmenu = document.getElementById("contextmenu");
const resizeNotif = document.getElementById("resizeNotif");

// enables functionality of software cursor
var customCursor = false;
// %
var grid_steps = 20;
// px
var fixed_grid = true
var grid_amount = 10


addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextmenu.style.display = "flex";
    contextmenu.style.left = e.clientX + "px";
    contextmenu.style.top = e.clientY + "px";
});

var lastElementClicked = null;
var doubleClickTimeout = 250;
var justClicked = false;
var doubleClickTimer = null;

addEventListener("click", (e) => {
    if (e.target != contextmenu) {
        contextmenu.style.display = "none";
    }
    lastElementClicked = e.target;
    if (justClicked && e.target == lastElementClicked) {
        justClicked = false;
        onDoubleClick(e);
    } else {
        justClicked = true;
        if (doubleClickTimer != null)
            clearTimeout(doubleClickTimer);
        doubleClickTimer = setTimeout(()=>{
            justClicked = false;
        }, doubleClickTimeout);
    }
});

function onDoubleClick(e) {
    if (e.target.className == "edge-top" || e.target.className == "edge-bottom"){
        e.target.parentNode.style.height = "100%";
    } else if (e.target.className == "edge-right"){
        if (e.target.parentNode.parentNode) {
            var resizing = e.target.parentNode;
            var resizingBound = resizing.getBoundingClientRect();
            var parent = resizing.parentNode;
            var parentBound = parent.getBoundingClientRect();
            var resizingLocalX = resizingBound.left - parentBound.left;
            resizing.style.width = ((parentBound.width - resizingLocalX) / parentBound.width) * 100 + "%";

        }
        else
            e.target.parentNode.style.width = "100%";
    }
}

var isResizing = false;
var resizingElement = null;
var resizingElement_starting_bound;
var resizing_right;
var resizing_left;
var resizing_top;
var resizing_bottom;
var resizingEdge = null;
var resizingElement_siblings_on_right = [];
var resizingElement_siblings_on_right_total_width = 0;
var resizingElement_siblings_on_right_needed_width = 0;
var resizingElement_siblings_on_left_and_right = []
var resizingElement_siblings_on_left = [];
var resizingElement_siblings_on_left_total_width = 0;
var resizingElement_siblings_on_bottom = [];
var resizingElement_siblings_on_bottom_total_height = 0;
var resizingElement_siblings_on_bottom_needed_height = 0;

function equal(a, b, error_margin) {
    return Math.abs(a-b) <= error_margin;
}
addEventListener("mousedown", (e) => {
    if (e.target.className == "edge-bottom") {
        e.preventDefault();
        e.stopPropagation();
        resizingElement = e.target.parentNode;
        resizingElement_starting_bound = resizingElement.getBoundingClientRect();
        resizingEdge = e.target;

        if (resizingElement_starting_bound.bottom != resizingElement.parentNode.bottom) {
            isResizing = true;
            resizeNotif.style.display = "flex";
            resizing_bottom = true;
            resizingElement_siblings_on_left_and_right = [];
            var siblings = Array.from(resizingElement.parentNode.children);
            var resizingElementIndex = siblings.indexOf(resizingElement);
            for (var i = 0; i < siblings.length; i++) {
                if (i != resizingElementIndex)
                    if (siblings[i].getBoundingClientRect().top === resizingElement.getBoundingClientRect().top)
                        resizingElement_siblings_on_left_and_right.push(siblings[i]);
            }
        }

        resizingElement_siblings_on_bottom = [];
        resizingElement_siblings_on_bottom_total_height = 0;
        resizingElement_siblings_on_bottom_needed_height = 0;
        var last_top = -999;
        for (var i = resizingElementIndex + 1; i < siblings.length; i++) {
            if (siblings[i].getBoundingClientRect().top > resizingElement.getBoundingClientRect().top) {
                let sibling_height = siblings[i].getBoundingClientRect().height
                resizingElement_siblings_on_bottom.push([siblings[i], sibling_height]);
                if (siblings[i].getBoundingClientRect().top != last_top)
                    resizingElement_siblings_on_bottom_total_height += sibling_height;
                if (siblings[i].hasAttribute("resize_height_min"))
                    if (siblings[i].getBoundingClientRect().top != last_top)
                        resizingElement_siblings_on_bottom_needed_height += Number(siblings[i].getAttribute("resize_height_min"));
                if (siblings[i].getBoundingClientRect().top != last_top)
                    last_top = siblings[i].getBoundingClientRect().top;
            }
        }

    }
    else if (e.target.className == "edge-right") {
        e.preventDefault();
        e.stopPropagation();
        resizingElement = e.target.parentNode;
        resizingElement_starting_bound = resizingElement.getBoundingClientRect();
        resizingEdge = e.target;
        if (e.altKey ||
            !equal(resizingElement_starting_bound.left + resizingElement_starting_bound.width,
            resizingElement.parentNode.getBoundingClientRect().left + resizingElement.parentNode.getBoundingClientRect().width, 2)){
            isResizing = true;
            resizeNotif.style.display = "flex";
            resizing_right = true;
            resizingElement_siblings_on_right = [];
            resizingElement_siblings_on_right_total_width = 0;
            resizingElement_siblings_on_right_needed_width = 0;
            var siblings = Array.from(resizingElement.parentNode.children);
            var resizingElementIndex = siblings.indexOf(resizingElement);
            for (var i = resizingElementIndex + 1; i < siblings.length; i++) {
                if (siblings[i].getBoundingClientRect().top == resizingElement.getBoundingClientRect().top) {
                    let sibling_width = siblings[i].getBoundingClientRect().width
                    resizingElement_siblings_on_right.push([siblings[i], sibling_width]);
                    resizingElement_siblings_on_right_total_width += siblings[i].getBoundingClientRect().width;
                    if (siblings[i].hasAttribute("resize_width_min"))
                        resizingElement_siblings_on_right_needed_width += Number(siblings[i].getAttribute("resize_width_min"));
                }
            }
        }
    } else if (e.target.className == "edge-top") {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeNotif.style.display = "flex";
        resizingElement = e.target.parentNode;
        resizingElement_starting_bound = resizingElement.getBoundingClientRect();
        resizingEdge = e.target;
        resizing_top = true;
    } else if (e.target.className == "edge-left") {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeNotif.style.display = "flex";
        resizingElement = e.target.parentNode;
        resizingElement_starting_bound = resizingElement.getBoundingClientRect();
        resizingEdge = e.target;
        resizing_left = true;
        resizingElement_siblings_on_left = [];
        var siblings = parentNode.childNodes();
        var resizingElementIndex = siblings.find(resizingElement);
        for (var i = 0; i < resizingElementIndex-1; i++) {
            if (siblings[i].getBoundingClientRect().clientY == resizingElement.getBoundingClientRect()/clientY)
                resizingElement_siblings_on_left.push([siblings[i], siblings[i].getBoundingClientRect().width]);
        }
    }
});

addEventListener("mouseup", (e) => {
    isResizing = false;
    resizeNotif.style.display = "none";
    resizing_right = false;
    resizing_left = false;
    resizing_top = false;
    resizing_bottom = false;
});

function round(number, increment, offset) {
    return Math.ceil((number - offset) / increment ) * increment + offset;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


var lastTargetTagName = "none"
addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--mouse-x", e.clientX + "px");
    document.documentElement.style.setProperty("--mouse-y", e.clientY + "px");
    if (isResizing) {
        e.preventDefault();
        e.stopPropagation();
        var parentBound = resizingElement.parentNode.getBoundingClientRect();
        var selfBound = resizingElement.getBoundingClientRect();

        
        var grid_size = {x: grid_amount, y: grid_amount}
        if (e.ctrlKey) {
            grid_size = {x: 1, y: 1}
        }
        var to_percentage = resizingEdge.hasAttribute("percent");
        var unit = to_percentage ? "%" : "px";
        var value = {x: selfBound.x, y: selfBound.y};

        if (!fixed_grid && !e.ctrlKey)
            grid_size = {
                x: (parentBound.width)/ grid_steps,
                y: (parentBound.height) / grid_steps

            }

        var min = 0;
        var max = 999;
        if (resizing_right) {
            value.x = round(e.clientX - selfBound.left, grid_size.x, 10);
            max = parentBound.width - (resizingElement.getBoundingClientRect().left - parentBound.left) - resizingElement_siblings_on_right_needed_width;
            if (resizingElement.hasAttribute("resize_width_min"))
                min = resizingElement.getAttribute("resize_width_min");
            value.x = clamp(value.x, min, max);
            if (!e.altKey) {
                var remaining_width = resizingElement_siblings_on_right_total_width - (value.x - resizingElement_starting_bound.width);
                var sibling_width_multiplier = remaining_width / resizingElement_siblings_on_right_total_width;
                resizingElement_siblings_on_right.forEach(sibling_data => {
                    sibling_data[0].style.width = ((sibling_data[1] / parentBound.width) * sibling_width_multiplier) * 100 + "%";
                });
            }
        }
        else if (resizing_left)
            value.x = round(resizingElement.style.width = selfBound.right - e.clientX, grid_size.x, 10);

        if (resizing_bottom) {
            value.y = round(resizingElement.style.height = e.clientY - selfBound.top, grid_size.y, 10);
            max = parentBound.height - (resizingElement.getBoundingClientRect().top - parentBound.top);
            if (resizingElement.hasAttribute("resize_height_min"))
                min = resizingElement.getAttribute("resize_height_min");
            value.y = clamp(value.y, min, max);
            if (!e.altKey) {
                resizingElement_siblings_on_left_and_right.forEach(sibling => {
                    sibling.style.height = (value.y / parentBound.height * 100) + "%";
                });

                var remaining_height = resizingElement_siblings_on_bottom_total_height - (value.y - resizingElement_starting_bound.height);
                var sibling_height_multiplier = remaining_height / resizingElement_siblings_on_bottom_total_height;
                resizingElement_siblings_on_bottom.forEach(sibling_data => {
                    sibling_data[0].style.height = ((sibling_data[1] / parentBound.height) * sibling_height_multiplier) * 100 + "%";
                });
            }

        }
        else if (resizing_top)
            value.y = round(resizingElement.style.height = selfBound.bottom - e.clientY, grid_size.y, 10);
        
        if (to_percentage)
            value = {
                x: (value.x / parentBound.width) * 100,
                y: (value.y / parentBound.height) * 100
            };
        resizeNotif.innerText = ""
        if (resizing_left || resizing_right) {
            resizingElement.style.width = value.x + unit
            resizeNotif.innerText += "x: " + Math.floor(value.x) + unit
        }
        if (resizing_top || resizing_bottom) {
            resizingElement.style.height = value.y + unit
            resizeNotif.innerText += "y: " + Math.floor(value.y) + unit
        }


    }
    else if (e.target.tagName != lastTargetTagName) {
        lastTargetTagName = e.target.tagName
        if (customCursor) {
            if (e.target.tagName == "BUTTON" || e.target.tagName == "LI" ) {
                document.documentElement.style.setProperty("--cursor-width", "calc(var(--ui-font-size)*.33)")
                document.documentElement.style.setProperty("--cursor-height", "calc(var(--ui-font-size)*.33)")
            }
            else if (e.target.tagName == "TEXTAREA") {
                document.documentElement.style.setProperty("--cursor-width", "calc(var(--ui-font-size)*.175)")
                document.documentElement.style.setProperty("--cursor-height", "calc(var(--ui-font-size)*1.33)")
            }
            else {
                document.documentElement.style.setProperty("--cursor-width", "calc(var(--ui-font-size)*.66)")
                document.documentElement.style.setProperty("--cursor-height", "var(--ui-font-size)")
            }
        }
    }
});

var all_text_areas = document.getElementsByClassName("code");
for (var i = 0; i < all_text_areas.length; i++) {
    const area = all_text_areas[i]
    area.addEventListener("input", (e) => {
        var lines = area.value.split(/\r|\r\n|\n/);
        var lineCount = lines.length;
        var nums = area.parentNode.getElementsByClassName("num-bar")[0]
        var linesTillSelection = area.value.substr(0, area.selectionStart).split("\n");
        var currentLine = linesTillSelection[linesTillSelection.length - 1];
        var currentLineIndex = linesTillSelection.length - 1
        
        if (lineCount.length != nums.childNodes.length) {
            var newNums = ""
            for (n = 0; n < lineCount; n++)
                newNums += "<li>";
            nums.innerHTML = newNums;
        }
    })
}
