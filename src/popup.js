/* Copyright 2017 Christopher Floess

 *   This file is part of Copy Buddy.

 *   Copy Buddy is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   Copy Buddy is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 */
// Why does this version break the tests on TravisCI?
// var browser = typeof browser !== "undefined" ? browser : chrome;
// document.addEventListener("DOMContentLoaded", startApp);
var browser = typeof chrome !== "undefined" ? chrome : browser;
document.addEventListener("DOMContentLoaded", startApp(browser, document));

function startApp(browser, document){
    let brauser = browser;
    let dokument = document;

    return function() {
        let input = dokument.getElementById("copy-input");
        let usageMessage = "Click to copy, double-click to edit";
        input.addEventListener("keypress", function(event){
            if (event.keyCode === 13) {
                if(event.shiftKey) {
                    return;
                }
                let dataFor = this.getAttribute("data-for");
                event.preventDefault();
                if( dataFor != null ) {
                    let element = dokument.getElementById(dataFor);
                    updateElement(this.value, dataFor, element);
                    element.setAttribute("style", "display: block");
                    this.value="";
                } else {
                    saveElementToCopyElements(this.value);
                    this.value="";
                }
            }
        });
        input.addEventListener("focus", function(){
            setStatus("Enter to Save, Shift-Enter for new line");
        });
        input.addEventListener("blur", function(){
            setStatus(usageMessage);
        });

        brauser.storage.local.get(null, function(storage) {
            if (storage.copyElements && storage.copyElements.length != 0){
                setStatus(usageMessage);
                storage.copyElements.forEach(function(text, index){
                    createElementWithText(text, index);
                });
            } else {
                saveElementToCopyElements("Double-click to edit");
            }
        });

    }

    function updateElement(text, id, element) {
        brauser.storage.local.get(null, function(storage) {
            let index = parseInt(id);

            if(text.length == 0) {
                storage.copyElements.splice(index, 1);
            } else {
                storage.copyElements[index] = text;
            }

            let myElement = element;

            brauser.storage.local.set({
                copyElements: storage.copyElements
            }, function() {
                setElementContent(myElement, text);
            });
        });
    }

    function saveElementToCopyElements(text) {
        let copyElements;
        brauser.storage.local.get(null, function(storage) {
            if (!storage.copyElements){
                copyElements = [];
            } else {
                copyElements = storage.copyElements;
            }

            if(text.length != 0) {
                copyElements.push(htmlifyText(text));
            }

            brauser.storage.local.set({
                copyElements: copyElements
            }, function() {
                createElementWithText(text, copyElements.length - 1);
            }.bind(this));
        });
    }

    var timer = 0;
    var delay = 300;
    var prevent = false;

    function createElementWithText(text, id) {
        let container = dokument.getElementById("container");
        let newDiv = dokument.createElement("div");
        let newP = dokument.createElement("p");

        setElementContent(newP, text);
        newP.setAttribute("title", text);
        newP.setAttribute("id", id);
        newP.setAttribute("class", "copy-item");
        newDiv.appendChild(newP);
        container.appendChild(newDiv);

        newP.addEventListener("click", function(event) {
            timer = setTimeout(function() {
                if (!prevent) {
                    var range = dokument.createRange();
                    range.selectNode(event.target);

                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    try {
                        dokument.execCommand("copy");
                        setStatus("\"" + newP.textContent + "\" copied to clipboard");
                        setTimeout(window.close, 750);
                    } catch(err) {
                        console.log("Oops, unable to cut");
                    }
                }
                prevent = false;
            }, delay);

        });
        newP.addEventListener("dblclick", function(event) {
            clearTimeout(timer);
            prevent = true;
            let input = dokument.getElementById("copy-input");
            let target = event.target;
            input.value = extractText(target);
            input.focus();
            input.setAttribute("data-for", target.id);
            target.setAttribute("style", "display: none");

        }.bind(this));
    }

    function setElementContent(element, text) {
        element.innerHTML = htmlifyText(text);
    }

    function htmlifyText(text){
        return text.replace(/(?:\r\n|\r|\n)/g, "<br \/>");
    }

    function setStatus(text) {
        let status = dokument.getElementById("status");
        status.textContent = text;
    }

}

// has to stay here because of tests see. Issue is open
// https://github.com/flooose/copy_buddy/issues/6
function extractText(element) {
    return element.innerText;
}
