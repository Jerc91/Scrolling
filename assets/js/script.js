/* ===========================================================
 * jquery-onepage-scroll.js v1.1.1
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * Credit: Eike Send for the awesome swipe event
 * https://github.com/peachananr/onepage-scroll
 * 
 * License: GPL v3
 *
 * ========================================================== */
!function ($) {
    var defaults = {
        sectionContainer: "section",
        easing: "ease",
        animationTime: 1000,
        pagination: true,
        updateURL: false,
        keyboard: true,
        beforeMove: null,
        afterMove: null,
        loop: false,
        menus: ".menu", // classes for menus
        ca: "active", // Class for a active 
        key: "index",// data-?? for know the attribute with the index active
        index: 0,
        current: {},
        next: {}
    };
    /*------------------------------------------------*/
    /*  Credit: Eike Send for the awesome swipe event */
    /*------------------------------------------------*/
    $.fn.swipeEvents = function () {
        return this.each(function () {
            var startX, startY, $this = $(this);
            $this.bind('touchstart', touchstart);
            function touchstart(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    startX = touches[0].pageX;
                    startY = touches[0].pageY;
                    $this.bind('touchmove', touchmove);
                }
                event.preventDefault();
            }
            function touchmove(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    var deltaX = startX - touches[0].pageX;
                    var deltaY = startY - touches[0].pageY;
                    if (deltaX >= 50) $this.trigger("swipeLeft");
                    if (deltaX <= -50) $this.trigger("swipeRight");
                    if (deltaY >= 50) $this.trigger("swipeUp");
                    if (deltaY <= -50) $this.trigger("swipeDown");
                    if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) $this.unbind('touchmove', touchmove);
                }
                event.preventDefault();
            }
        });
    };
    $.fn.onepage_scroll = function (options) {
        var settings = $.extend({}, defaults, options), el = $(this), sections = $(settings.sectionContainer), total = sections.length, status = "off", topPos = 0, lastAnimation = 0, quietPeriod = 500, paginationList = "";
        $.fn.transformPage = function (settings, pos, index) {
            $(this).css({
                "-webkit-transform": "translate3d(0, " + pos + "%, 0)",
                "-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
                "-moz-transform": "translate3d(0, " + pos + "%, 0)",
                "-moz-transition": "all " + settings.animationTime + "ms " + settings.easing,
                "-ms-transform": "translate3d(0, " + pos + "%, 0)",
                "-ms-transition": "all " + settings.animationTime + "ms " + settings.easing,
                "transform": "translate3d(0, " + pos + "%, 0)",
                "transition": "all " + settings.animationTime + "ms " + settings.easing
            });
            $(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                if (typeof settings.afterMove == 'function') settings.afterMove(index);
            });
        }
        $.fn.moveDown = function () { change($(this), true); }
        $.fn.moveUp = function () { change($(this), false); }
        function init_scroll(event, delta) {
            deltaOfInterest = delta;
            var timeNow = new Date().getTime();
            // Cancel scroll if currently animating or within quiet period
            if (timeNow - lastAnimation < quietPeriod + settings.animationTime) {
                event.preventDefault();
                return;
            }
            if (deltaOfInterest < 0) el.moveDown();
            else el.moveUp();
            lastAnimation = timeNow;
        }
        // Prepare everything before binding wheel scroll
        el.addClass("onepage-wrapper").css("position", "relative");
        $.each(sections, function (i) {
            $(this).css({
                position: "absolute",
                top: topPos + "%"
            }).addClass("section").attr("data-" + settings.key + "", i + 1);
            topPos = topPos + 100;
            if (settings.pagination == true) paginationList += "<li><a data-" + settings.key + "='" + (i + 1) + "' href='#" + (i + 1) + "'></a></li>"
        });
        el.swipeEvents().bind("swipeDown", function () { el.moveUp(); }).bind("swipeUp", function () { el.moveDown(); });
        // Create Pagination and Display Them
        if (settings.pagination == true) {
            $("<ul class='onepage-pagination " + settings.menus.substring(1, settings.menus.length) + "'>" + paginationList + "</ul>").prependTo("body");
            posTop = (el.find(".onepage-pagination").height() / 2) * -1;
            el.find(".onepage-pagination").css("margin-top", posTop);
        }
        if (window.location.hash != "" && window.location.hash != "#1") {
            settings.index = window.location.hash.replace("#", ""); change($(this), true, true);
        } else {
            $(settings.sectionContainer + "[data-" + settings.key + "='1']").addClass(settings.ca);
            $("body").addClass("viewing-page-1");
            if (settings.pagination == true) $(settings.menus).find("li a" + "[data-" + settings.key + "='1']").addClass(settings.ca);
        }
        if (settings.pagination == true) {
            $(settings.menus).find("li a").click(function () { change(el, true, false, $(this)); if (settings.updateURL == false) return false; });
        }
        $(document).bind('mousewheel DOMMouseScroll', function (event) {
            event.preventDefault();
            var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
            init_scroll(event, delta);
        });
        if (settings.keyboard == true) {
            $(document).keydown(function (e) {
                var tag = e.target.tagName.toLowerCase();
                switch (e.which) {
                    case 38:
                        if (tag != 'input' && tag != 'textarea') el.moveUp()
                        break;
                    case 40:
                        if (tag != 'input' && tag != 'textarea') el.moveDown()
                        break;
                    default: return;
                }
                e.preventDefault();
            });
        }
        function change($el, down, location, $link) {
            settings.index = ($link) ? $link.data(settings.key) : $(settings.sectionContainer + "." + settings.ca).data(settings.key);
            settings.index += 1 * ((location || $link) ? -1 : 0);
            settings.current = ($link) ? $(settings.sectionContainer + "." + settings.ca) : $(settings.sectionContainer + "[data-" + settings.key + "='" + settings.index + "']");
            settings.next = $(settings.sectionContainer + "[data-" + settings.key + "='" + (settings.index + (1 * (down) ? +1 : -1)) + "']");
            if (settings.next.length < 1) {
                if (settings.loop == true) {
                    pos = (down) ? 0 : ((total - 1) * 100) * -1;
                    settings.next = $(settings.sectionContainer + "[data-" + settings.key + "='" + (down) ? 1 : total + "']");
                } else return;
            } else pos = ((down) ? settings.index + (1 * (location) ? -1 : 0) : settings.next.data(settings.key) - 1) * 100 * -1;
            if (typeof settings.beforeMove == 'function') settings.beforeMove(settings.current.data(settings.key));
            settings.current.removeClass(settings.ca);
            settings.next.addClass(settings.ca);
            if (settings.pagination == true) {
                $(settings.menus).find("li a" + "." + settings.ca).removeClass(settings.ca);
                $(settings.menus).find("li a" + "[data-" + settings.key + "='" + settings.next.data(settings.key) + "']").addClass(settings.ca);
            }
            $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
            $("body").addClass("viewing-page-" + settings.next.data(settings.key));
            if (history.replaceState && settings.updateURL == true) {
                var href = window.location.href.substr(0, window.location.href.settings.indexOf('#')) + "#" + (settings.index + (1 * (down) ? +1 : -1));
                history.pushState({}, document.title, href);
            }
            $el.transformPage(settings, pos, settings.index);
        }
        return false;
    }
}(window.jQuery);

$(document).ready(function () {$("#content").onepage_scroll({ sectionContainer: 'section', easing: 'ease', animationTime: 1000, pagination: true, updateURL: false, loop: false, menus: ".menu" });});