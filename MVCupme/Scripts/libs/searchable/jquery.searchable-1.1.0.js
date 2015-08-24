/*! jQuery Searchable v1.1.0 by Stidges (http://twitter.com/stidges) | MIT */ ! function(a) {
    function b(a) {
        return "function" == typeof a
    }

    function c(b, c) {
        this.$element = a(b), this.settings = a.extend({}, e, c), this.init()
    }
    var d = "searchable",
        e = {
            selector: "tbody tr",
            childSelector: "td",
            searchField: "#search",
            striped: !1,
            oddRow: {},
            evenRow: {},
            hide: function(a) {
                a.hide()
            },
            show: function(a) {
                a.show()
            },
            searchType: "default",
            onSearchActive: !1,
            onSearchEmpty: !1,
            onSearchFocus: !1,
            onSearchBlur: !1,
            clearOnLoad: !1
        },
        f = !1,
        g = !1,
        h = !1,
        i = !1;
    c.prototype = {
        init: function() {
            this.$searchElems = a(this.settings.selector, this.$element), this.$search = a(this.settings.searchField), this.matcherFunc = this.getMatcherFunction(this.settings.searchType), this.determineCallbacks(), this.bindEvents(), this.updateStriping()
        },
        determineCallbacks: function() {
            f = b(this.settings.onSearchActive), g = b(this.settings.onSearchEmpty), h = b(this.settings.onSearchFocus), i = b(this.settings.onSearchBlur)
        },
        bindEvents: function() {
            var b = this;
            this.$search.on("change keyup", function() {
            	//JP BUSQUEDA A PARTIR DEL 4 CARACTER	console.log(a(this).val());
            	if (a(this).val().length > 2){
	            	b.search(a(this).val())	, b.updateStriping()
	            }	
               
                
            })
            , h && this.$search.on("focus", this.settings.onSearchFocus), i && this.$search.on("blur", this.settings.onSearchBlur), this.settings.clearOnLoad === !0 && (this.$search.val(""), this.$search.trigger("change")), "" !== this.$search.val() && this.$search.trigger("change")
        },
        updateStriping: function() {
            var b = this,
                c = ["oddRow", "evenRow"],
                d = this.settings.selector + ":visible";
            this.settings.striped && a(d, this.$element).each(function(d, e) {
                a(e).css(b.settings[c[d % 2]])
            })
        },
        search: function(b) {
            var c, d, e, h, i, j, k, l;
            if (0 === a.trim(b).length) return this.$searchElems.css("display", ""), this.updateStriping(), void(g && this.settings.onSearchEmpty(this.$element));
            for (f && this.settings.onSearchActive(this.$element, b), d = this.$searchElems.length, c = this.matcherFunc(b), k = 0; d > k; k++) {
                for (j = a(this.$searchElems[k]), e = j.find(this.settings.childSelector), h = e.length, i = !0, l = 0; h > l; l++)
                    if (c(a(e[l]).text())) {
                        i = !1;
                        break
                    }
                i === !0 ? this.settings.hide(j) : this.settings.show(j)
            }
        },
        getMatcherFunction: function(a) {
            return "fuzzy" === a ? this.getFuzzyMatcher : "strict" === a ? this.getStrictMatcher : this.getDefaultMatcher
        },
        getFuzzyMatcher: function(a) {
            var b, c = a.split("").reduce(function(a, b) {
                return a + "[^" + b + "]*" + b
            });
            return b = new RegExp(c, "gi"),
                function(a) {
                    return b.test(a)
                }
        },
        getStrictMatcher: function(b) {
            return b = a.trim(b),
                function(a) {
                    return -1 !== a.indexOf(b)
                }
        },
        getDefaultMatcher: function(b) {
            return b = a.trim(b).toLowerCase(),
                function(a) {
                    return -1 !== a.toLowerCase().indexOf(b)
                }
        }
    }, a.fn[d] = function(b) {
        return this.each(function() {
            a.data(this, "plugin_" + d) || a.data(this, "plugin_" + d, new c(this, b))
        })
    }
}(jQuery, window, document);