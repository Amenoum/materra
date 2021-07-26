String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.decapitalize = function() {
	return this.charAt(0).toLowerCase() + this.slice(1);
}
String.prototype.escapeRegExp = function() {
	return this.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
String.prototype.padNumber = function(limit = 3, padchar = '&nbsp;') {
	var str = this, len = this.length;
	while (len++ < limit) str = padchar + str;
	return str;
}
String.prototype.niceNumber = function(html=false) {
	return this.replace(/e\+?([0-9-]+)/i, ' * 10'+(html?'<sup>$1</sup>':'^$1'));
}
String.prototype.synonyms = function() {
	var tmp = this.split(' = '); out = []
	if (tmp.length > 1) {
		$(tmp).each(function (idx) {
			out.push(this.trim());
		});
	}
	return out;
}
String.prototype.isQuestion = function() {
	return this.match(/^(what|who|where|when|how|do|does|is|will|shall|can)\b/i); // common
}
String.prototype.express = function() {
	var ret = this.replace(/\^\{([^\}]+)\}/g, '<sup>$1</sup>');
	ret = ret.replace(/\^([^\^])/g, '<sup>$1</sup>');
	ret = ret.replace(/_\{([^\}]+)\}/g, '<sub>$1</sub>');
	ret = ret.replace(/_([^_])/g, '<sub>$1</sub>');
	ret = ret.replace('__', '_').replace('^^', '^');
	return ret;
},
String.prototype.abbreviation = function() {
	var ret = this.replace(/[^a-z0-9\s]+/gi, '').replace(/\s+/g, ' ');
	let tmp = ret.split(' ');
	ret = '';
	$(tmp).each(function (idx) {
		ret += this.charAt(0).toUpperCase();
	});
	return ret;
}
String.prototype.markKeywords = function(keywords) {
	let tmp = keywords.toLowerCase().trim().replace(/^(a|the)\s+/, '');
	var myRegexp;
	if (this.toLowerCase().indexOf(tmp) >= 0) {
		myRegexp = new RegExp('([^A-Za-z0-9ČĆŽŠĐčćžšđ]*)('+tmp.escapeRegExp()+')([^A-Za-z0-9ČĆŽŠĐčćžšđ])', 'gi');
		return this.replace(myRegexp, '$1<b>$2</b>$3');
	}
	keywords = tmp.split(/[^a-z0-9\-]+/);
	var $this = this;
	$(keywords).each(function(idx) {
		let cur_keyword = (this).trim();
		myRegexp = new RegExp('([^A-Za-z0-9ČĆŽŠĐčćžšđ]*)('+cur_keyword.escapeRegExp()+')([^A-Za-z0-9ČĆŽŠĐčćžšđ])', 'g');
		$this = $this.replace(myRegexp, '$1<b>$2</b>$3');
	});
	return $this;
}
String.prototype.htmlentities = function() {
	return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
String.prototype.toURL = function(title = null) {
	if (title === null) title = this;
	return '<a href="'+this+'">'+title+'</a>';
}
String.prototype.HTMLize = function(postfix='', advanced=false) {
	let str = this;
	if (advanced) {
		let x;
		if ((x = str.indexOf('-')) >=0) {
			if (x == 0) str = str.replace(/^\-([^\n]+)/, '<li>$1</li>');
			str = str.replace(/\n\-([^\n]+)/g, '<li>$1</li>');
			str = str.replace(/^(.*?)\<li\>/, '$1<ul><li>').replace(/^(.*)\<\/li\>/, '$1</li></ul>');
		}
	}
	str = str.replace(/\/n/g, "\n").replace(/\n/g, '<br>'+postfix).replace(/\s{4}/g, "\t").replace(/\/t/g, "\t").replace(/\t/g, '&nbsp;&nbsp;&nbsp; ');
	if (advanced)
		str = str.replace(/<br><br>\s*</g, '<').replace(/>\s*<br><br>/g, '>');
	return str;
}
String.prototype.niceJSON = function() {
	return this.replace(/([^\\]),"/g, '$1, "').replace(/":(["{])/g, '": $1').replace(/"(https?:\/\/.+?)",/g, '"<a href="$1" noref>$1</a>",').replace(/":\s*([0-9]+)/g, '": <em>$1</em>').replace(/":\s*true/g, '": <b><span true>true</span></b>').replace(/":\s*false/g, '": <span false>false</span>').replace(/":\s*null/g, '": <span false>null</span>');
}
String.prototype.stripTags = function(removeContent=0) {	// 0 => conserve tag content, 1 => remove tag content, >1 => remove only if result is not empty
	let ret = this.replace(/<!--[\s\S]*?-->/g , '');
	if (removeContent > 0) {
		let max_loops = 10;
		while (ret.indexOf('<') >= 0 && max_loops-- > 0)	// loop to remove outer tags also, in case of nesting
			ret = ret.replace(/<[^\/][^>]*>[^<]*<\/[^>]*>/g, '');
		if (removeContent < 2 || ret.length > 0) return ret;
	}
	return ret.replace(/<[^>]+>/g, '');
}
String.prototype.latexReplace = function(regex, replacement) {
	let regexp = new RegExp('([^\$])\$'+regex, 'g');
	let ret = this.replace(regexp, '$1'+replacement.replace(/^[\$]+/, ''));
	regexp = new RegExp(regex+'\$([^\$])', 'g');
	ret = ret.replace(regexp, replacement.replace(/[\$]+$/, ' ')+'$1');
	regexp = new RegExp('\{'+regex+'\}', 'g');
	ret = ret.replace(regexp, '{'+replacement.replace(/[\$]+/g, '')+'}');
	regexp = new RegExp(regex, 'g');
	ret = ret.replace(regexp, replacement);
	return ret;
}
String.prototype.latexize = function(doSubs = true) {
	let ret = this.replace(/<em>(.+?)<\/em>/g, '\\textit{$1}');
	ret = ret.replace(/<ul[^>]*>/g, '\\begin{itemize}').replace(/<\/ul[^>]*>/g, '\\end{itemize}');
	ret = ret.replace(/<ol[^>]*>/g, '\\begin{enumerate}').replace(/<\/ol[^>]*>/g, '\\end{enumerate}');
	ret = ret.replace(/<li[^>]*>([\s\S]+?)<\/li>/g, '\\item $1');
	if (doSubs == true) {
		ret = ret.replace(/<sup[^>]*>/g, '$$^{').replace(/<\/su[pb][^>]*>/g, '}$$');
		ret = ret.replace(/<sub[^>]*>/g, '$$_{');
	}
	else {
		ret = ret.replace(/<\/?(su[bp][^>]*|b)>/g, '');
	}
	ret = ret.latexReplace('Δ', '$$\\Delta$$').latexReplace('∝', '$$\\propto$$').latexReplace('∈', '$$\\in$$').latexReplace('ℤ', '$$\\mathbb{Z}$$').latexReplace('ω', '$$\\omega$$').latexReplace('φ', '$$\\phi$$');
	ret = ret.latexReplace('ℚ', '$$\\mathbb{Q}$$').latexReplace('ℏ', '$$\\hbar$$').latexReplace('∞', '$$\\infty$$').latexReplace('ε', '$$\\epsilon$$').latexReplace('μ', '$$\\mu$$').latexReplace('π', '$$\\pi$$');
	ret = ret.latexReplace('ρ', '$$\\rho$$').latexReplace('ℕ', '$$\\mathbb{N}$$').latexReplace('≠', '$$\\neq$$').latexReplace('[β]', '$$\\beta$$').latexReplace('[⊙☉]', '$$\\odot$$').latexReplace('≥', '$$\\geq$$');
	ret = ret.latexReplace('≈', '$$\\approx$$').latexReplace('⊕', '$$\\oplus$$').latexReplace('δ', '$$\\delta$$').latexReplace('σ', '$$\\sigma$$').latexReplace('α', '$$\\alpha$$').latexReplace('γ', '$$\\gamma$$');
	ret = ret.latexReplace('Ω', '$$\\Omega$$').latexReplace('ϕ', '$$\\varphi$$').latexReplace('∓', '$$\\mp$$').latexReplace('°', '$$^{\\circ}$$').latexReplace('λ', '$$\\lambda$$');
	ret = ret.latexReplace('′', '\'');
	ret = ret.replace(/\$(\\[A-Z\{\}]+)\$[\$]/ig, '$$$1 ').replace(/[\$]\$(\\[A-Z\{\}]+)\$/ig, ' $1$$');	// shouldn't be necessary
	ret = ret.replace(/\{\$(\\[A-Z\{\}]+)\$([_\^\}])/ig, '{$1$2');
	/*let max_loops = 6;
	while (max_loops-- > 0) {// loop, in case of multiple nesting
		ret = ret.replace(/(\$[_\^]\{[^\$\{\}\r\n]*)\$([^\$\{\}\r\n]*)\$([^\}\$\r\n]*\}\$)/g, '$1$2$3');
		ret = ret.replace(/(\$[_\^]\{[^\$\{\}\r\n]*)\$([_\^]\{[^\$\{\}\r\n]*\})\$([^\}\$\r\n]*\}\$)/g, '$1$2$3');
	}*/
	return ret;
}
String.prototype.niceLatex = function(eol) {
	let ret = this.replace(/(\$\$.+?\$\$)/g, eol+'$1'+eol);
	//ret = ret.replace(/(\\begin\{[^\}]+\})/g, eol+'$1').replace(/(\\end\{[^\}]+\})/g, eol+'$1'+eol);
	ret = ret.replace(/(\\item )/g, eol+'$1');
	ret = ret.replace(/\r[\n]*/g, eol).replace(/[\r]*[\n]/g, eol);
	ret = ret.replace(/:\\noindent/g, ':'+eol+'\\noindent');
	ret = ret.replace(/[√](.)/g, '$$\\sqrt{$1}$$');
	ret = ret.replace(/(\$.*?)\\gt(.*?\$)/g, '$1>$2').replace(/(\$.*?)\\lt(.*?\$)/g, '$1<$2');
//	let max_loops = 6;
//	while (max_loops-- > 0)	// loop, in case of multiple repeated nesting
//		ret = ret.replace(/([^\$]\$[\^_]\{[^\s\r\n]*)\$([^\s\r\n]*)\$([^\s\r\n]*\}\$[^\$])/g, '$1 $2 $3');
	ret = ret.replace(/([\r\n])\$_\{([\r\n]+\\paragraph)/g, '$1$2').replace(/([^\\])#/g, '$1\\#');
	return ret;
}
String.prototype.makeFileName = function() {
	return this.replace(/[\"\']/g, '');
}
String.prototype.hashCode = function(usenegative) {	// simple hashing function, usable for small n (<10000)
	let hash = 0, i = 0, len = this.length;
	while (i < len) {
		hash = ((hash << 5) - hash) + this.charCodeAt(i++);
		hash |= 0;	// conversion to 32bit int
	}
	if (usenegative) return hash;
	return (hash + 2147483647) + 1;
}
String.prototype.shuffloid = function() {
	if (Math.random() < 0.75) return this;
	let reflections = ['I am', 'Am I'];
	let str = this;
	if (str.indexOf(reflections[0]) >= 0)
		return str.replace(reflections[0], reflections[1]);
	if (str.indexOf(reflections[1]) >= 0)
		return str.replace(reflections[1], reflections[0]);
	return str;
}
String.prototype.break = function(limit) {
	var ret = [], str = this;
	while (str.length > limit) {
		ret.push(str.substring(0, limit));
		str = str.substring(limit);
	}
	if (str.length > 0) ret.push(str);
	return ret;
}		
String.prototype.compareTo = function(str) {
	var matchpoints = 0, $this, offset = 0;
	var tmp = this.toLowerCase().trim().replace(/^(a|the)\s+/, '');
	var tmp2 = str.toLowerCase().trim().replace(/^(a|the)\s+/, '');
	tmp = tmp.split(/[^a-z0-9\-]+/);
	tmp2 = tmp2.split(/[^a-z0-9\-]+/);
	var total = tmp.length, tmp3, matches = 0, matches_length = 0, total_length = 0, bad_matches = 0;
	$(tmp).each(function(idx) {
		total_length += this.valueOf().length;
		$this = this;
		$(tmp2).each(function(idx2) {
			if (this.valueOf() == $this.valueOf()) {
				if (this.valueOf().match(/^(of|a|the)$/)) ++bad_matches;
				tmp3 = idx2 - offset;
				if (tmp3 < 0) tmp3 *= -1;
				tmp3 -= idx;
				if (tmp3 < 0) tmp3 *= -1;
				matchpoints += total - tmp3;
				matches_length += this.valueOf().length;
				++matches;
				offset = idx2 - idx;
				return false;	// No additional score for repeats
			}
		});
	});
	if (bad_matches == matches) return 0;
	return (matchpoints * matches_length) / (total * matches * total_length);
}
/*
console.log('MATCHPOINTS = '+('existence of a single entity ').compareTo('existence of a single entity'));	// 5
console.log('MATCHPOINTS = '+('existence of a single entity ').compareTo('existence single entity'));		// 2.6
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('existence single entity'));			// 3
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('test existence single entity'));		// 2.666
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('test proba existence single entity'));	// 2.333
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('single entity'));						// 1.666
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('single test entity'));					// 1.333
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('single existence entity'));			// 2.333
console.log('MATCHPOINTS = '+('existence single entity ').compareTo('single entity existence'));			// 2
*/
	
var root = {
	const: function(str, showunit=true, divider=1, round=-1, html=false) {
		var tmp = str.split('.');
		var obj = universes.earth.constants, unit = '';
		$(tmp).each(function (idx) {
			obj = obj[this];
			if (typeof(obj.unit) != 'undefined') unit = ' '+obj.unit;
		});
		if (divider!=1) obj /= divider;
		if (round >= 0) obj = obj.toFixed(round);
		return obj.toString().niceNumber(html)+(showunit?unit:'');
	},
	calc: function(e) {
		var val;
		e = e.replace(/const\(/g, 'this.const(');
		try {
			val = eval('`'+eval(e)+'`');
		}
		catch (error) { 
			//if (!silent) root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); 
			//return false;
			console.warn('root.calc() ERROR: '+error.message+'.');
			val = '*** ERROR *** Cannot eval "'+e+'" *** ERROR ***';
		}
		return val;
	},
	eval: function(str, text = false) {
		//str = str.replace(/calc\(/g, 'this.calc(');
		if (text)
			return str.replace(/&lt;c&gt;(.*?)&lt;\/c&gt;/g, function(match, contents, offset, input) {
				return root.calc(contents);
			});
		return str.replace(/\<c\>(.*?)\<\/c\>/g, function(match, contents, offset, input) {
			return root.calc(contents);
		});
	},
	id: '<div style="display:inline-block">MATERRA</div> OS',
	about: '\tMATERRA OS is a system developed to enhance the possibilities of interaction between a user and a website and to provide automatic generation/rendering of content common in scientific articles.\n\n\tIt allows the user to customize the look of a webpage, interact with its elements, automate tasks and add new elements (with all changes being stored locally, in browser storage space).\n\n\tAdvanced interaction is enabled through a command line interface (CLI) - the usage of which is simple, however, a user familiar with js/jquery and html/css will be able to get the most out of it.',
	ver: '2021.07.14',
	init_run_num: 0,
	alienized: false,
	use_body_expanders: 1,
	build_figures: 0,
	storeLocal: function(item, val, namespace = 'root.cmd.local') {
		item = namespace+'.'+item;
		if (typeof(Storage) !== 'undefined') {
			localStorage.setItem(item, val);	// string!
		}
		else { console.log('No storage'); }
	},
	getLocal: function(item, namespace = 'root.cmd.local') {
		item = namespace+'.'+item;
		if (typeof(Storage) !== 'undefined') {
			return localStorage.getItem(item);
		}
		//else {}	// alternative?
		return null;
	},
	removeLocal: function(item, namespace = 'root.cmd.local') {
		item = namespace+'.'+item;
		if (typeof(Storage) !== 'undefined') {
			localStorage.removeItem(item);
		}
		//else {}
	},
	observers : [],
	editable: {
		oDoc: null,
		editable_js_loaded: false,
		editable_box: null,
		sDefTxt: '',
		last_keyCode: 0,
		edit_mode : 0,
		formatDoc: function(sCmd, sValue) {
		  if (this.validateMode()) { document.execCommand(sCmd, false, sValue); this.oDoc.focus(); }
		},
		validateMode: function() {
		  if (!$('body div.toolbar .switchMode').prop('checked')) { return true ; }
		  alert("Uncheck \"Show CODE\".");
		  this.oDoc.focus();
		  return false;
		},
		extractText: function(oDoc) {
			if (oDoc.innerText) { return oDoc.innerText; }
			var oContent = document.createRange();
			oContent.selectNodeContents(oDoc.firstChild);
			return oContent.toString();
		},
		setDocMode: function(oDoc, bToSource) {
			if (bToSource) {
				var oContent = document.createTextNode(oDoc.innerHTML), oPre = document.createElement("pre");
				oDoc.innerHTML = "";
				oDoc.contentEditable = false;
				oPre.className = "rte-sourcetext";
				oPre.id = "rte-source-" + oDoc.id;
				oPre.onblur = oDoc.onblur;
				oPre.contentEditable = true;
				oPre.appendChild(oContent);
				oDoc.appendChild(oPre);
			} else {
				oDoc.innerHTML = this.extractText(oDoc);
				oDoc.contentEditable = true;
			}
			oDoc.focus();
		},
		getDocTypeAsString: function () {
			var node = document.doctype;
			return node ? "<!DOCTYPE "
				 + node.name
				 + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
				 + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
				 + (node.systemId ? ' "' + node.systemId + '"' : '')
				 + '>\n' : '';
		},
		cleanUp: function(a) {
			a.textContent = 'Downloaded';
			a.dataset.disabled = true;
			// Need a small delay for the revokeObjectURL to work properly.
			setTimeout(function() {
				window.URL.revokeObjectURL(a.href);
			}, 1500);
		},
		downloadFile: function() {
			if ($('.switchMode').prop('checked')) {
				$('.switchMode').prop('checked', false);
				$('.switchMode').change();
			}
			var Whole = this.getDocTypeAsString() + document.documentElement.outerHTML;
			var regRep = '<style type=\\"text/css\\">\\.MathJax_Hover_Frame[\\s\\S]*id=\\"MathJax_Message\\" style=\\"display: none;\\"></div>';
			Whole = Whole.replace(new RegExp(regRep,""), '');
			regRep = '<script type=\\"text\\/javascript\\" async=\\"\\" src=\\"https\\:\\/\\/cdnjs\\.cloudflare\\.com\\/ajax\\/libs\\/mathjax\\/2\\.7\\.5\\/MathJax\\.js\\?config=TeX-MML-AM_CHTML\\&amp\\;latest\\"><\\/script>';
			// Escaping some chars so the js doesn't get removed
			Whole = Whole.replace(new RegExp(regRep,""), '');
			Whole = Whole.replace(new RegExp(' contenteditable="true"\\>', 'g'), '>');
			Whole = Whole.replace(new RegExp('class="toolbar" style="display: block;"\\>', ''), 'class="toolbar">');
			Whole = Whole.replace(new RegExp('\\s+\\<\\!--PLACE--\\>\\s+', ''), "\r\n"+'</head>'+"\r\n"+'<body>'+"\r\n"+'<!--PLACE-->'+"\r\n\r\n");
			Whole = Whole.replace(new RegExp('<!-- SP_ACTIONS -->.*?<!-- /SP_ACTIONS -->', 'g'), '');
			var container = document.querySelector('.toolbar');
			var output = container.querySelector('output');
			const MIME_TYPE = 'text/html';
			window.URL = window.webkitURL || window.URL;
			var prevLink = output.querySelector('a');
			if (prevLink) {
				window.URL.revokeObjectURL(prevLink.href);
				output.innerHTML = '';
			}

			var bb = new Blob([Whole], {type: MIME_TYPE});

			var a = document.createElement('a');
			a.download = container.querySelector('input[type="text"]').value;
			a.href = window.URL.createObjectURL(bb);
			a.textContent = 'Download ready';

			a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
			a.draggable = true; // Don't really need, but good practice.
			a.classList.add('dragout');

			output.appendChild(a);

			a.onclick = function(e) {
				if ('disabled' in this.dataset) {
					return false;
				}
				root.editable.cleanUp(this);
			};
			a.click();
		},
		insertMetachars: function(sStartTag, sEndTag, onEmpty) {
			let oMsgInput = this.editable_box[0];
			let bDouble = arguments.length > 1, nSelStart = oMsgInput.selectionStart, nSelEnd = oMsgInput.selectionEnd, sOldText = oMsgInput.value;
			let emptyStr = (onEmpty && sOldText.substring(nSelStart, nSelEnd).length < 1?onEmpty:'');
			if (sStartTag.match(/\<update\>/)) {
				let date = new Date(), dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
				let [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat.formatToParts(date);
				sStartTag = sStartTag.replace(/\<update\>/, '<update date="'+year+'.'+month+'.'+day+'">');
			}
			oMsgInput.value = sOldText.substring(0, nSelStart)+(bDouble ? sStartTag + sOldText.substring(nSelStart, nSelEnd) + emptyStr + sEndTag : sStartTag + emptyStr) + sOldText.substring(nSelEnd);
			oMsgInput.setSelectionRange(bDouble || nSelStart === nSelEnd ? nSelStart + sStartTag.length : nSelStart, (bDouble ? nSelEnd : nSelStart) + sStartTag.length);
			oMsgInput.focus();
		},
		toolboxActions: {	// can define custom() function in these instead of metachars
			'equation': { title: 'Insert equation', icon: '&#8959;', metachars: ['<e>$', '$</e>'] },
			'equation_ds': { title: 'Insert equation with displaystyle set', icon: '&#8959;<sub>d</sub>', metachars: ['<e>$\\displaystyle ', '$</e>'] },
			'indent': { title: 'Insert indentation', icon: '<img src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==">', metachars: ['<br><br><span class="indent"></span>', ''] },
			'timerel': { title: 'Insert note', icon: '<span>N</span>', metachars: ['<div timerel>', '</div>'] },
			'timerel_f': { title: 'Insert update', icon: '<span>U</span>', metachars: ['<update></update>'+"\n"+'<div timerel class="future">', '</div>'] },
			'right': { title: 'Insert right-aligned text', icon: '<img src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==">', metachars: ['<right>', '</right>'] }
		},
		createToolbox: function(where) {
			var toolbar;
			let button_size = 'h3';
			if (typeof($('body div.toolbar').html()) == 'undefined') {
				toolbar = $('<div class="toolbar"></div>');
				var toolbar_actions = $('<!-- SP_ACTIONS --><div class="spirit_actions size'+button_size+'"></div><!-- /SP_ACTIONS -->');
				$(Object.keys(this.toolboxActions)).each(function (idx) {
					toolbar_actions.append($('<div class="spirit_button" data-type="'+this+'" title="'+root.editable.toolboxActions[this].title.htmlentities()+'">'+root.editable.toolboxActions[this].icon+'</div>'));
				});
				toolbar.append(toolbar_actions);
				$('.spirit_button', toolbar).on('mousedown', function(event) {
					event.preventDefault();		// must prevent textarea from loosing focus, otherwise it's gone
					let el = root.editable.toolboxActions[$(this).attr('data-type')];
					if (typeof(el.custom) != 'undefined')
						el.custom();
					else if (typeof el.metachars[2] != 'undefined')
						root.editable.insertMetachars(el.metachars[0], el.metachars[1], el.metachars[2]);
					else
						root.editable.insertMetachars(el.metachars[0], el.metachars[1]);
				});
			}
			else toolbar = $('body div.toolbar');
			toolbar.insertBefore($(where));
			toolbar.show();
			//toolbar.scrollToMe();
		},
		init: function() {
			if (!this.editable_js_loaded) {
				var $this = this;
				$.ajax({
					url: '/jquery-editable-master/jquery.editable.js',
					dataType: 'script',
					cache: true
				}).done(function() {
					$this.editable_js_loaded = true;
					$this.init();
				}).fail(function (xhr, status, error) {
					console.error('EDITABLE.INIT.ajax() ERROR '+xhr.status+': '+xhr.statusText);
					root.cmd.say('Network error encountered, jquery.editable.js not loaded.');
				});
				return;
			}
			/*
			$('body div.toolbar .switchMode').on('change', function() {
				if (root.editable.oDoc === null) return;
				//console.log(root.editable.oDoc);
				if ($(this).prop('checked'))
					$(root.editable.oDoc).untransformSpirit(true);
				else {
					$(root.editable.oDoc).transformSpirit(true);
					//MathJax.Hub.Queue(["Reprocess", MathJax.Hub, root.editable.oDoc]);
				}
				root.editable.setDocMode(root.editable.oDoc, $(this).prop('checked'));
			});
			$('body div.toolbar > .intLink').on('click', function() {
				if ($(this).attr('data-param')) {
					root.editable.formatDoc($(this).attr('data-action'), $(this).attr('data-param'));
					return;
				}
				root.editable.formatDoc($(this).attr('data-action'));
			});
			$('body div.toolbar > .intLinkClean').on('click', function() {
				if(root.editable.validateMode()&&confirm('Are you sure?')){root.editable.oDoc.innerHTML=root.editable.sDefTxt};
			});
			$('body div.toolbar > .intLinkURL').on('click', function() {
				var sLnk=prompt('Write the URL here','https:\/\/');if(sLnk&&sLnk!=''&&sLnk!='https://'){let sel=window.getSelection().getRangeAt(0);window.getSelection().addRange(sel);root.editable.formatDoc('createlink',sLnk)}
			});
			$('#save').on('click', function() {
				root.editable.downloadFile();
			});
			document.execCommand("defaultParagraphSeparator", false, "br");
			*/
		},
		uninit: function() {
			/*
			$('#save, body div.toolbar > .intLinkURL, body div.toolbar > .intLinkClean, body div.toolbar > .intLink').off('click');
			$('body div.toolbar .switchMode').off('change');*/
			let toolbar = $('body div.toolbar');
			$('.spirit_button', toolbar).off('mousedown');
			toolbar.remove();
		}
	},
	spirits: {
		transformAll: function() {
			var tmp, i, j, out;
			$('spirit').each(function (idx) {
				$(this).transformSpirit();
			});
		},
		buildBlocks: function() {
			$('body .spirit').each(function(idx) {
				if ($(this).hasClass('postulates')) {
					$('h3', $(this)).addClass('postulate');
				}
				$(this).html($(this).html().replace(/(\<h[234])/g, '</div><div class="spirit">$1'));
			});
			$('body .spirit').each(function(idx) {
				if ($(this).children().first().hasClass('spirit')) {
					$(this).children().first().attr('class', $(this).attr('class'));
					$(this).replaceWith($(this).html());
				}
			});
		},
		initMatter: function(after, heading_type = 'h2', movable = false) {
			if (typeof after.next('div.spirit_actions').html() != 'undefined') return false;
			var newEl = $('<!-- SP_ACTIONS --><div class="spirit_actions size'+heading_type+'"><div class="spirit_add" title="Create new text block">'+'+</div>'+(movable?'<div class="spirit_up" title="Move text block up">&and;</div><div class="spirit_down" title="Move text block down">&or;</div><div class="spirit_destroy red" title="Remove this text block (hold shift when serious)">&cross;</div>':'')+'</div><!-- /SP_ACTIONS -->');
			if (movable && heading_type == 'h2' && !after.hasClass('log_header')) {
				let sel_class_cur = (after.hasClass('definitions')?'definitions':(after.hasClass('postulates')?'postulates':''));
				let sel_class = $('<select name="class_sel"><option value=""'+(sel_class_cur==''?' selected="selected"':'')+'>-</option><option value="definitions"'+(sel_class_cur=='definitions'?' selected="selected"':'')+'>Definitions</option><option value="postulates"'+(sel_class_cur=='postulates'?' selected="selected"':'')+'>Postulates</option></select>');
				sel_class.on('change', function(e) {
					after.removeClass('postulates').removeClass('definitions');
					if (this.value != '') after.addClass(this.value);
					root.webpages.save_remote();
				});
				let spirit_class = $('<div class="spirit_class"><label for="class_sel">Class:&nbsp; </label></div>').append(sel_class);
				newEl.append(spirit_class);
			}
			var $this = this;
			$('.spirit_add', newEl).on('click', function(e) {
				e.stopPropagation();
				$this.createSpirit($(this).parent(), heading_type, 'local');
			});
			if (movable) {
				$('.spirit_up', newEl).on('click', function(e) {
					e.stopPropagation();
					$this.moveSpiritUp($(this).parent());
				});
				$('.spirit_down', newEl).on('click', function(e) {
					e.stopPropagation();
					$this.moveSpiritDown($(this).parent());
				});
				$('.spirit_destroy', newEl).on('click', function(e) {
					e.stopPropagation();
					if (e.shiftKey)	// if shift is down, don't ask, delete
						root.spirits.destroySpirit($(this).parent().prev('.spirit'));
					else {
						//ask: function(input, callback, timeout = false, callback_on_timeout = false)
						root.cmd.ask('Are you sure?', function(answer) { if (answer===false || answer.toLowerCase().trim() == 'y' || answer.toLowerCase().trim() == 'yes') { root.spirits.destroySpirit($(this).parent().prev('.spirit')); root.cmd.say('Done.'); } else root.cmd.say('Ok.') }.bind(this), 5000, true);
					}
				});
			}
			after.after(newEl);
		},
		uninitMatter: function(spirit = false) {
			if (spirit === false) {
				$('body div.spirit_actions > .spirit_down, body div.spirit_actions > .spirit_up, body div.spirit_actions > .spirit_destroy, body div.spirit_actions > .spirit_add').off('click');
				$('body div.spirit_actions').remove();
			}
			else {
				spirit.next('.spirit_actions').children().off('click');
				spirit.next('.spirit_actions').remove();
			}
		},
		createHeading: function(caption='New', addclass = '') {
			var heading_type = 'h1';
			var newEl = $('<div class="spirit main_head'+(addclass!=''?' '+addclass:'')+'" data-type="'+heading_type+'">'+"\r\n"+'<'+heading_type+'>'+caption+'</'+heading_type+'>'+'</div>');
			$('body').prepend(newEl);
			$('div#window0 > h1:first-of-type').html(caption);
			return newEl;
		},
		createSpirit: function(after = false, heading_type = 'h2', addclass = '', caption='New', placeholder=true) {
			var newEl = $('<div class="spirit editable'+(addclass!=''?' '+addclass:'')+'" data-type="'+heading_type+'">'+"\r\n"+'<'+heading_type+'>'+caption+'</'+heading_type+'>'+(placeholder && heading_type=='h2'?'<br>':'')+"\r\n"+(placeholder?'<span class="indent"></span>Something new.'+"\r\n":'')+'</div>');
			if (after === false) {
				if (typeof $('body > .footer').html() != 'undefined') $('body > .footer').before(newEl);
				else $('body').append(newEl);
			}
			else after.after(newEl);
			newEl.fixSpiritCaption();
			this.initMatter(newEl, heading_type, true);
			//this.initSpirit(newEl);	// this is callied in makeEditable
			this.makeEditable(newEl);
			return newEl;
		},
		moveSpiritUp: function(what) {
			var spirit = what.prev('.spirit');
			var prev = spirit.prev();
			if (prev.hasClass('toolbar')) prev = prev.prev();
			prev = prev.prev();
			what.insertBefore(prev);
			spirit.insertBefore(what);
			spirit.scrollToMe();
			root.summary.build();
			root.summary.buildHTML(root.cmd.local.view.val, true);
			root.webpages.save_remote();
			root.cmd.updateDir();
		},
		moveSpiritDown: function(what) {
			var spirit = what.prev('.spirit');
			var next = what.next();
			if (next.hasClass('toolbar')) next = next.next();
			next = next.next();
			spirit.insertAfter(next);
			what.insertAfter(spirit);
			spirit.scrollToMe();
			root.summary.build();
			root.summary.buildHTML(root.cmd.local.view.val, true);
			root.webpages.save_remote();
			root.cmd.updateDir();
		},
		destroySpirit: function(spirit, no_update=false) {
			let el = $('h2, h3, h4', spirit);
			if (typeof(el.prop("tagName")) != 'undefined') {
				var heading_num = parseInt(el.prop("tagName").replace(/^[^0-9]+/, '')), next_spirit, next_el;
				while (1) {
					next_spirit = spirit.nextAll('.spirit:first');
					if (typeof(next_spirit.html()) == 'undefined') break;
					next_el = $('h2, h3, h4', next_spirit);
					if (typeof(next_el.prop("tagName")) != 'undefined' && parseInt(next_el.prop("tagName").replace(/^[^0-9]+/, '')) > heading_num)
						this.destroySpirit(next_spirit, true);
					else break;
				}
			}
			this.uninitMatter(spirit);
			this.uninitSpirit(spirit);
			spirit.remove();
			if (no_update) return;
			root.summary.build();
			root.summary.buildHTML(root.cmd.local.view.val, true);
			root.webpages.save_remote();
			root.cmd.updateDir();
		},
		initSpirit: function(spirit) {
			/*
			spirit.prop('contenteditable', true);
			spirit.on("input", function() {
				console.log("input event fired");
				root.editable.oDoc = this;
			});
			spirit.on("click", function() {
				console.log("click event fired");
				if (root.editable.oDoc === this) return;
				if ($('.switchMode').prop('checked')) {
					$('.switchMode').prop('checked', false);
					$('.switchMode').trigger('change');
				}
				var oldoDoc = root.editable.oDoc;
				//jQuery.fn.removeTypeset(this);
				MathJax.Hub.Queue(jQuery.fn.removeTypeset(this));
				root.editable.oDoc = this;
				var toolbar = $('body div.toolbar');
				toolbar.insertBefore($(this));
				toolbar.show();
				$('.switchMode').prop('checked', true);
				$('.switchMode').trigger('change');
				// To reprocess all elements on page: MathJax.Hub.Queue(["Reprocess",MathJax.Hub]);
				if (oldoDoc !== null) {
					$(oldoDoc).html($(oldoDoc).html().replace(/\$([^\$]+?)\$/g, '<script type="math/tex" id="">$1<\/script>'));
					MathJax.Hub.Queue(["Reprocess", MathJax.Hub, oldoDoc]);
				}
				toolbar.scrollToMe();
			});
			spirit.on('keydown', function(e) {
				//e.preventDefault(); e.stopPropagation();
				if (root.editable.last_keyCode != 17)
					root.editable.last_keyCode = e.keyCode;
				if (e.keyCode == 9)	{	// TAB
					e.preventDefault();
					root.editable.formatDoc('insertText', String.fromCharCode(9));
					return false;
				}
			});
			spirit.on('keyup', function(e) {
				//e.preventDefault(); e.stopPropagation();
				var action = 'HTML';
				if ($('.switchMode').prop('checked')) action = 'Text';
				if (e.keyCode == 13 && root.editable.last_keyCode == 17) {
				}
				else if (e.keyCode == 60 && root.editable.last_keyCode == 17) { // Ctrl - >
					e.preventDefault(); e.stopPropagation();
					root.editable.formatDoc('insert'+action, '<br><br><span class="indent"></span>');
				}
				root.editable.last_keyCode = 0;
				//console.log(e);
			});
			*/
			if (spirit.hasClass('local')) {
				root.summary.build();
				root.summary.buildHTML(root.cmd.local.view.val, true);
				root.webpages.save_remote();
				if (!spirit.is(':editable')) {
					spirit.editable({
						touch : true, // Whether or not to support touch (default true)
						lineBreaks : false, // Whether or not to convert \n to <br /> (default true)
						toggleFontSize : false, // Whether or not it should be possible to change font size (default true),
						closeOnEnter : false, // Whether or not pressing the enter key should close the editor (default false)
						event : 'clicked', // The event that triggers the editor (default dblclick)
						tinyMCE : false, // Integrate with tinyMCE by settings this option to true or an object containing your tinyMCE configuration
						emptyMessage : '<em>Something new.</em>', // HTML that will be added to the editable element in case it gets empty (default false)
						callback : function( data ) {
							// Callback that will be called once the editor is blurred
							if (data.content) {
								// Content has changed...
								//console.log('CONTENT=', data.$el.html());
								data.$el.fixSpiritCaption();
								var first_child = data.$el.children().first();
								first_child.attr('idx', data.$el.attr('data-idx'));
								if (data.$el.attr('data-pre') != '')
									first_child.html('<span>'+data.$el.attr('data-pre')+'</span> '+first_child.html());
							}
							/*if( data.fontSize ) {
								// the font size has changed
							}*/
							//console.log(data);
							// data.$el gives you a reference to the element that was edited
							//data.$el.effect('blink');
							data.$el.transformSpirit();
							root.clearPast($('div[timerel]', data.$el)); // should probably be in transformSpirit()
							data.$el.html(data.$el.html().replace(/\$([^\$]+?)\$/g, '<script type="math/tex" id="">$1<\/script>'));
							if (data.content) {
								var buildref = false;
								$('a', data.$el).each(function (idx) {
									if (!$(this).hasAttribute('noref')) {
										buildref = true;
										return false;	// break
									}
								});
								if (buildref) {
									root.unbuildReferences();
									root.buildReferences();
								}
								if (1 || typeof($('update', data.$el).html()) != 'undefined') root.buildChangeLog();	// UPDATE: we need to build always, due to a possibility of removed update
								if (data.$el.attr('data-old-hash') != first_child.attr('hash')) {
									root.summary.build();
									root.summary.buildHTML(root.cmd.local.view.val, true);
								}
								root.webpages.save_remote();
							}
							MathJax.Hub.Queue(["Reprocess", MathJax.Hub, data.$el[0]]);
							//if (!data.$el.is(':editable')) root.spirits.initSpirit(data.$el);
							$('body div.toolbar').hide();
						}
					});
					spirit.on('click', function(e) {
						//console.log('click event fired');
						if ($(this).is(':editing')) return false;
						jQuery.fn.removeTypeset(this);
						$(this).html($(this).html().replace(/\<script type="math\/tex" id="[^"]*"\>([\s\S]*?)\<\/script\>/g, '$$$1$$'));
						root.unclearPast($('div[timerel]', $(this))); // should probably be in untransformSpirit()
						let el = $(this).children().first();
						$(this).attr('data-idx', el.attr('idx'));
						$(this).attr('data-old-hash', el.attr('hash'));
						let myRegexp = /^\<span\>([0-9\.]+)\<\/span\>\s+/;
						let match = myRegexp.exec(el.html());
						if (match !== null && typeof(match[1]) != 'undefined') {
							$(this).attr('data-pre', match[1]);
							el.html(el.html().replace(myRegexp, ''));
						}
						else $(this).attr('data-pre', '');
						$(this).untransformSpirit();
						//root.editable.createToolbox(this);
						$(this).trigger('clicked');
					});
					spirit.on('edit', function(event, $editor) {
						console.log("edit event fired");
						// The below is needed if using event: 'click'
						/*
						let el = $('<div></div>');
						el.append($editor.val());
						//jQuery.fn.removeTypeset(el[0]);
						//MathJax.Hub.Queue(jQuery.fn.removeTypeset(el[0]));
						el.removeTypesetAlt();
						el.untransformSpirit();
						$editor.val(el.html());
						el.remove();
						*/
						root.editable.editable_box = $editor;
						root.editable.createToolbox(this);
					});
				}
			}
			else {
				spirit.on('click', function(e) {
					if (root.editable.edit_mode)
						root.cmd.say('Cannot edit remote content.');
					else
						$(this).off('click');
				});
			}
		},
		uninitSpirit: function(spirit = false) {
			if (spirit === false) {
				spirit = $('body .spirit');
				spirit.each(function (idx) {
					if ($(this).hasClass('local') && $(this).is(':editable')) $(this).editable('destroy');
				});
			}
			else if (spirit.hasClass('local') && spirit.is(':editable')) spirit.editable('destroy');
			spirit.off('keyup');
			spirit.off('keydown');
			spirit.off('click');
			spirit.off('input');
			/*
			spirit.prop('contenteditable', false);
			*/
		},
		makeEditable: function(spirit = false) {
			root.editable.init();
			//console.log('editable_loaded: ', (root.editable.editable_js_loaded?'YES':'NO'));
			if (!root.editable.editable_js_loaded) {
				//console.log('WAITING_EDITABLE');
				setTimeout(root.spirits.makeEditable.bind(root.spirits, spirit), 300);
				return;
			}
			if (spirit === false) {
				spirit = $('body .spirit');
				spirit.each(function(idx) {
					let heading_type = 'h2';
					let el = $(this).children('h2,h3,h4').first();
					if (typeof(el.prop("tagName")) != 'undefined') heading_type = el.prop("tagName").toLowerCase();		// .main_head is h1
					$(this).addClass('editable');
					root.spirits.initMatter($(this), heading_type, $(this).hasClass('local'));
					root.spirits.initSpirit($(this));
				});
				/*
				var toolbar;
				if (typeof($('body div.toolbar').html()) == 'undefined') {
					toolbar = $('<div class="toolbar"></div>');
					let buttons = [], i;
					buttons.push('<img class="intLinkClean" title="Clean" src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7">');
					//buttons.push('<img class="intLink" title="Print" data-action-ext="print" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oEBxcZFmGboiwAAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUOMvtlUtsjFEUx//n3nn0YdpBh1abRpt4LFqtqkc3jRKkNEIsiIRIBBEhJJpKlIVo4m1RRMKKjQiRMJRUqUdKPT71qpIpiRKPaqdF55tv5vvusZjQTjOlseUkd3Xu/3dPzusC/22wtu2wRn+jG5So/OCDh8ycMJDflehMlkJkVK7KUYN+ufzA/RttH76zaVocDptRxzQtNi3mRWuPc+6cKtlXZ/sddP2uu9uXlmYXZ6Qm8v4Tz8lhF1H+zDQXt7S8oLMXtbF4e8QaFHjj3kbP2MzkktHpiTjp9VH6iHiA+whtAsX5brpwueMGdONdf/2A4M7ukDs1JW662+XkqTkeUoqjKtOjm2h53YFL15pSJ04Zc94wdtibr26fXlC2mzRvBccEbz2kiRFD414tKMlEZbVGT33+qCoHgha81SWYsew0r1uzfNylmtpx80pngQQ91LwVk2JGvGnfvZG6YcYRAT16GFtW5kKKfo1EQLtfh5Q2etT0BIWF+aitq4fDbk+ImYo1OxvGF03waFJQvBCkvDffRyEtxQiFFYgAZTHS0zwAGD7fG5TNnYNTp8/FzvGwJOfmgG7GOx0SAKKgQgDMgKBI0NJGMEImpGDk5+WACEwEd0ywblhGUZ4Hw5OdUekRBLT7DTgdEgxACsIznx8zpmWh7k4rkpJcuHDxCul6MDsmmBXDlWCH2+XozSgBnzsNCEE4euYV4pwCpsWYPW0UHDYBKSWu1NYjENDReqtKjwn2+zvtTc1vMSTB/mvev/WEYSlASsLimcOhOBJxw+N3aP/SjefNL5GePZmpu4kG7OPr1+tOfPyUu3BecWYKcwQcDFmwFKAUo90fhKDInBCAmvqnyMgqUEagQwCoHBDc1rjv9pIlD8IbVkz6qYViIBQGTJPx4k0XpIgEZoRN1Da0cij4VfR0ta3WvBXH/rjdCufv6R2zPgPH/e4pxSBCpeatqPrjNiso203/5s/zA171Mv8+w1LOAAAAAElFTkSuQmCC">');
					buttons.push('<img class="intLink" title="Undo" data-action="undo" src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=">');
					buttons.push('<img class="intLink" title="Redo" data-action="redo" src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==">');
					buttons.push('<img class="intLink" title="Remove formatting" data-action="removeFormat" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg==">');
					buttons.push('<img class="intLink" title="Bold" data-action="bold" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=">');
					buttons.push('<img class="intLink" title="Italic" data-action="italic" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==">');
					buttons.push('<img class="intLink" title="Underline" data-action="underline" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7">');
					buttons.push('<img class="intLink" title="Left align" data-action="justifyleft" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==">');
					buttons.push('<img class="intLink" title="Center align" data-action="justifycenter" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7">');
					buttons.push('<img class="intLink" title="Right align" data-action="justifyright" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==">');
					buttons.push('<img class="intLink" title="Numbered list" data-action="insertorderedlist" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAADljwliE35GjuaezxtHa7P///////yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKSespwjoRFvggCBUBoTFBeq6QIAysQnRHaEOzyaZ07Lu9lUBnC0UGQU1K52s6n5oEADs=">');
					buttons.push('<img class="intLink" title="Dotted list" data-action="insertunorderedlist" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAAB1ChF9vj1iE33mOrqezxv///////yH5BAEAAAcALAAAAAAWABYAAAMyeLrc/jDKSesppNhGRlBAKIZRERBbqm6YtnbfMY7lud64UwiuKnigGQliQuWOyKQykgAAOw==">');
					buttons.push('<img class="intLink" title="Quote" data-action="formatblock" data-param="blockquote" src="data:image/gif;base64,R0lGODlhFgAWAIQXAC1NqjFRjkBgmT9nqUJnsk9xrFJ7u2R9qmKBt1iGzHmOrm6Sz4OXw3Odz4Cl2ZSnw6KxyqO306K63bG70bTB0rDI3bvI4P///////////////////////////////////yH5BAEKAB8ALAAAAAAWABYAAAVP4CeOZGmeaKqubEs2CekkErvEI1zZuOgYFlakECEZFi0GgTGKEBATFmJAVXweVOoKEQgABB9IQDCmrLpjETrQQlhHjINrTq/b7/i8fp8PAQA7">');
					buttons.push('<img class="intLink" title="Delete indentation" data-action="outdent" src="data:image/gif;base64,R0lGODlhFgAWAMIHAAAAADljwliE35GjuaezxtDV3NHa7P///yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKCQG9F2i7u8agQgyK1z2EIBil+TWqEMxhMczsYVJ3e4ahk+sFnAgtxSQDqWw6n5cEADs=">');
					buttons.push('<img class="intLink" title="Add indentation" data-action="indent" src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==">');
					buttons.push('<img class="intLinkURL" title="Hyperlink" src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7">');
					buttons.push('<img class="intLink" title="Cut" data-action="cut" src="data:image/gif;base64,R0lGODlhFgAWAIQSAB1ChBFNsRJTySJYwjljwkxwl19vj1dusYODhl6MnHmOrpqbmpGjuaezxrCztcDCxL/I18rL1P///////////////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAVu4CeOZGmeaKqubDs6TNnEbGNApNG0kbGMi5trwcA9GArXh+FAfBAw5UexUDAQESkRsfhJPwaH4YsEGAAJGisRGAQY7UCC9ZAXBB+74LGCRxIEHwAHdWooDgGJcwpxDisQBQRjIgkDCVlfmZqbmiEAOw==">');
					buttons.push('<img class="intLink" title="Copy" data-action="copy" src="data:image/gif;base64,R0lGODlhFgAWAIQcAB1ChBFNsTRLYyJYwjljwl9vj1iE31iGzF6MnHWX9HOdz5GjuYCl2YKl8ZOt4qezxqK63aK/9KPD+7DI3b/I17LM/MrL1MLY9NHa7OPs++bx/Pv8/f///////////////yH5BAEAAB8ALAAAAAAWABYAAAWG4CeOZGmeaKqubOum1SQ/kPVOW749BeVSus2CgrCxHptLBbOQxCSNCCaF1GUqwQbBd0JGJAyGJJiobE+LnCaDcXAaEoxhQACgNw0FQx9kP+wmaRgYFBQNeAoGihCAJQsCkJAKOhgXEw8BLQYciooHf5o7EA+kC40qBKkAAAGrpy+wsbKzIiEAOw==">');
					buttons.push('<img class="intLink" title="Paste" data-action="paste" src="data:image/gif;base64,R0lGODlhFgAWAIQUAD04KTRLY2tXQF9vj414WZWIbXmOrpqbmpGjudClFaezxsa0cb/I1+3YitHa7PrkIPHvbuPs+/fvrvv8/f///////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAWN4CeOZGmeaKqubGsusPvBSyFJjVDs6nJLB0khR4AkBCmfsCGBQAoCwjF5gwquVykSFbwZE+AwIBV0GhFog2EwIDchjwRiQo9E2Fx4XD5R+B0DDAEnBXBhBhN2DgwDAQFjJYVhCQYRfgoIDGiQJAWTCQMRiwwMfgicnVcAAAMOaK+bLAOrtLUyt7i5uiUhADs=">');
					for (i=0; i<buttons.length; i++)
						toolbar.append($(buttons[i]));
					toolbar.append($('<p id="editMode"><input type="checkbox" class="switchMode" name="switchMode" id="switchBox"> <label for="switchBox">Show CODE</label></p>'));
					toolbar.append($('<input type="text" value="index.html" placeholder="index.html">'));
					toolbar.append($('<p><input type="button" id="save" value="Download"> <output><a download="index.html" href="blob:null/4d32be86-4c8d-48ac-ac5b-2f83917ba738" data-downloadurl="text/html:index.html:blob:null/4d32be86-4c8d-48ac-ac5b-2f83917ba738" draggable="true" class="dragout" data-disabled="true">Downloaded</a></output></p>'));
					$('body').append(toolbar);
					//$('body div.toolbar > img[data-action-ext="print"]').on('click', function(e) {
					//	printDoc();
					//});
				}*/
			}
			else root.spirits.initSpirit(spirit);
		},
		unmakeEditable: function() {
			root.editable.uninit();
			$('body .spirit').removeClass('editable');
			this.uninitSpirit();
			this.uninitMatter();
		},
		init: function() {
			this.transformAll();
			this.buildBlocks();
			if (root.editable.edit_mode)
				this.makeEditable();
			if (!root.webpages.is_local) {
				if (typeof($('log_keywords').html()) != 'undefined' && $('log_keywords').html() != '') {
					var keywords = $('log_keywords').html().split(',');
				}
				$('log_keywords').remove();
			}
			$('.spirit:not(.noformat)').each(function(idx) {
				$(this).formatSpirit();
				var $this = this, myRegexp;
				// PROCESS (MARK) KEYWORDS
				if (typeof(keywords) != 'undefined') {
					$(keywords).each(function(idx2) {
						let cur_keyword = (this).trim();
						if (cur_keyword.length < 2) return;	// continue
						myRegexp = new RegExp('([^A-Za-z0-9ČĆŽŠĐčćžšđ]*)('+cur_keyword.escapeRegExp()+')([^A-Za-z0-9ČĆŽŠĐčćžšđ])', 'g');
						$($this).html($($this).html().replace(myRegexp, '$1<b>$2</b>$3'));
					});
				}
				if (!root.webpages.is_local) {	// should be rewritten to affect only text nodes if possible
					// MARK figure/table REFERENCES
					myRegExp = new RegExp('([^A-Za-z0-9ČĆŽŠĐčćžšđ\\>]|[^bB]\\>)(Fig.|Table)(\\s*)([0-9]+)', 'g');
					$($this).html($($this).html().replace(myRegExp, '$1<b>$2</b> $4'));
					// MARK NUMBERS
					myRegexp = new RegExp('([^A-Za-z0-9ČĆŽŠĐčćžšđ])(\\-?[0-9][0-9A-ZČĆŽŠĐ\\.]*)', 'g');
					$($this).html($($this).html().replace(myRegexp, '$1<b>$2</b>'));
					// MARK Capitalized WORDS
					myRegexp = new RegExp('([^\\>\\.\\?\\:][\\s\\r\\n\\,\\(])((\\s?[A-ZČĆŽŠĐ][A-Za-z0-9ČĆŽŠĐčćžšđ\-]+)+)', 'g');
					$($this).html($($this).html().replace(myRegexp, '$1<b>$2</b>'));
					// MARK single Capitalized LETTERS
					myRegexp = new RegExp('([^\.][\\s\\,])([A-Z])([\\s\\r\\n\\.\\?\\,])', 'g');
					$($this).html($($this).html().replace(myRegexp, '$1<b>$2</b>$3'));
					// MARK Capitalized WORDS BEFORE/AFTER SUBS AND SUPS (IN CHEMICAL ELEMENTS)
					myRegexp = new RegExp('(su[bp]\\>)([A-Z][A-Za-z]*)', 'g');
					$($this).html($($this).html().replace(myRegexp, '$1<b>$2</b>'));
					myRegexp = new RegExp('([A-Z][A-Za-z]*)(\\<su[bp])', 'g');
					$($this).html($($this).html().replace(myRegexp, '<b>$1</b>$2'));
					// FIX POSSIBLE DAMAGE
					$($this).html($($this).html().replace(/\<b\>\<b\>([^\>]*)\<\/b\>\<\/b\>/g, '<b>$1</b>'));
					$($this).html($($this).html().replace(/\<b\>([^\<]+)\<b\>([^\<]*)\<\/b\>([^\<]*)\<\/b\>/g, '<b>$1$2$3</b>'));
					$('h1, h2, h3, h4, p.equation, e', $this).each(function(idx3) {
						$(this).html($(this).html().replace(/\<b\>([^\<]*)\<\/b\>/g, '$1'));
						if ($(this).hasAttribute('no_numbering'))
							$(this).attr('no_numbering', $(this).attr('no_numbering').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					// UNDO HTML BREAKING
					$('a', $this).each(function(idx4) {
						if ($(this).hasAttribute('href'))
							$(this).attr('href', $(this).attr('href').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('noref'))
							$(this).attr('noref', $(this).attr('noref').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('data-notitle'))
							$(this).attr('data-notitle', $(this).attr('data-notitle').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('title'))
							$(this).attr('title', $(this).attr('title').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('download'))
							$(this).attr('download', $(this).attr('download').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('ignore_build_local'))
							$(this).attr('ignore_build_local', $(this).attr('ignore_build_local').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));

					});
					$('img', $this).each(function(idx4) {
						if ($(this).hasAttribute('src'))
							$(this).attr('src', $(this).attr('src').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('alt'))
							$(this).attr('alt', $(this).attr('alt').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('title'))
							$(this).attr('title', $(this).attr('title').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('latex-width'))
							$(this).attr('latex-width', $(this).attr('latex-width').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('th,td', $this).each(function(idx4) {
						if ($(this).hasAttribute('colspan'))
							$(this).attr('colspan', $(this).attr('colspan').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('rowspan'))
							$(this).attr('rowspan', $(this).attr('rowspan').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('latex-width'))
							$(this).attr('latex-width', $(this).attr('latex-width').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('div.update', $this).each(function(idx4) {
						if ($(this).hasAttribute('date'))
							$(this).attr('date', $(this).attr('date').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						if ($(this).hasAttribute('nolink'))
							$(this).attr('nolink', $(this).attr('nolink').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('input', $this).each(function(idx4) {
						if ($(this).hasAttribute('value'))
							$(this).attr('value', $(this).attr('value').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[style]', $this).each(function(idx4) {
						$(this).attr('style', $(this).attr('style').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[latex-fontsize]', $this).each(function(idx4) {
						$(this).attr('latex-fontsize', $(this).attr('latex-fontsize').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[width]', $this).each(function(idx4) {
						$(this).attr('width', $(this).attr('width').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[height]', $this).each(function(idx4) {
						$(this).attr('height', $(this).attr('height').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[desc]', $this).each(function(idx4) {
						$(this).attr('desc', $(this).attr('desc').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[data-state]', $this).each(function(idx4) {
						$(this).attr('data-state', $(this).attr('data-state').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
						$(this).attr('data-src', $(this).attr('data-src').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[state]', $this).each(function(idx4) {
						$(this).attr('state', $(this).attr('state').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[hash]', $this).each(function(idx4) {
						$(this).attr('hash', $(this).attr('hash').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[pos-hash]', $this).each(function(idx4) {
						$(this).attr('pos-hash', $(this).attr('pos-hash').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
					$('*[prev-pos-hash]', $this).each(function(idx4) {
						$(this).attr('prev-pos-hash', $(this).attr('prev-pos-hash').replace(/\<[^\>]+\>([^\<]*)\<\/[^\>]*\>/g, '$1'));
					});
				}
			});
			// CHECK FOR SETTINGS
			root.summary.body_numbering = 1;
			if (typeof($('set_body_numbering').html()) != 'undefined') {
				root.summary.body_numbering = $('set_body_numbering').html();
				//root.summary.clear();
				$('set_body_numbering').remove();
			}
			root.build_figures = 0;
			if (typeof($('build_figures').html()) != 'undefined') {
				root.build_figures = $('build_figures').html();
				$('build_figures').remove();
			}
			$('body').removeClass();
			if (typeof($('set_body_class').html()) != 'undefined') {
				$('body').addClass($('set_body_class').html());
				console.log('BODY CLASS SCIENTIFIC = '+($('body').hasClass('scientific')?'Yes':'No'));
				$('set_body_class').remove();
			}
			// RENDER ANSWERS
			$('answer_body').each(function (idx) {
				//function(content = false, target = false, target_only_body = false)
				root.cmd.cmds.talk.exec($(this).html(), this, true);
			});
			root.latex.authors = [];
			$('log_author').each(function (idx) {
				let addr = '', email = '';
				if (typeof($('log_address', $(this))) != 'undefined') addr = $('log_address', $(this)).text();
				if (typeof($('log_email', $(this))) != 'undefined') email = $('log_email', $(this)).text().replace('{EAT}', '@');
				$('log_address', $(this)).remove();
				$('log_email', $(this)).remove();
				root.latex.authors.push({ name: $(this).text(), address: addr, 'email': email});
			});
			root.latex.cite.doi = ''; root.latex.cite.year = ''; root.latex.cite.contrib = '';
			if (typeof($('log_date').html()) != 'undefined' && $('log_date').text().length>0) root.latex.cite.year = $('log_date').text().trim().replace(/^([0-9]+).*$/, '$1');
			if (typeof($('log_update').html()) != 'undefined' && $('log_update').text().length>0) root.latex.cite.year = $('log_update').text().trim().replace(/^([0-9]+).*$/, '$1');
			if (typeof($('cite_doi').html()) != 'undefined') root.latex.cite.doi = $('cite_doi').text();
			if (typeof($('cite_year').html()) != 'undefined') root.latex.cite.year = $('cite_year').text();
			if (typeof($('cite_contrib').html()) != 'undefined') root.latex.cite.contrib = (($('cite_contrib').html().trim().indexOf('/') == 0)?location.origin+$('cite_contrib').html().trim():$('cite_contrib').html().trim());
			// MAKE LOG HEADER
			if (typeof($('log_id').html()) != 'undefined') {
				$('body').addClass('log_entry');
				let tmp = $('<table class="head"></table>');
				let tr = $('<tr></tr>');
				let hasupdate = typeof($('log_update').html()) != 'undefined' && $('log_update').html().length>0;
				if (typeof($('log_id').html()) != 'undefined') tr.append($('<td class="log_id">'+$('log_id').html()+'</td>'));
				tr.append($('<td class="date'+(hasupdate?' hasupdate':'')+'"><div>Created: [ <span>'+(typeof($('log_date').html()) != 'undefined'?$('log_date').html()+'</span> ]</div>':'')+(1&&hasupdate?'&nbsp; <div>Updated: [ <span class="update" title="Last update">'+$('log_update').html()+'</span> ]</div>':'')+'</td>'));
				//tr.append($('<td class="update">'+(hasupdate?'| Last update: <span>'+$('log_update').html()+'</span>':'')+'</td>'));
				tr.append($('<td class="author">'+(typeof($('log_author').html()) != 'undefined'?$('log_author').html():'')+'</td>'));
				tmp.append(tr);
				$('body').prepend(tmp);
			}
			if (root.webpages.is_local) return;
			let el = $('<div class="tags"></div>');
			if (typeof($('log_category').html()) != 'undefined') {
				el.insertBefore($('log_category'));
				el.html($((typeof ($('log_category_caption').html()) != 'undefined')?'log_category_caption':'log_category').html().capitalize());
				if (el.html() != '') el.html('<span>'+el.html()+'</span>');
				//$('<div>Category: <span>'+$('log_category').html().capitalize()+'</span></div>').insertBefore($('log_category'));
			}
			else if (typeof($('log_tags').html()) != 'undefined')
				el.insertBefore($('log_tags'));
			root.latex.keywords = '';
			root.latex.use_keywords = 0;
			if (typeof($('log_tags').html()) != 'undefined') {
				root.latex.keywords = $('log_tags').text();
				let arr = $('log_tags').html().split(',');
				var arr_str = '';
				$(arr).each(function (idx) {
					arr_str += (arr_str!=''?', ':'')+'<a href="index.php?tag='+encodeURI(this.trim())+'" noref="1" class="local">'+this.htmlentities()+'</a>';
				});
				el.html((el.html()!=''?el.html()+': ':'')+arr_str);
				//$('<div>Tags: <span>'+$('log_tags').html()+'</span></div>').insertBefore($('log_tags'));
				if (typeof($('log_id').html()) == 'undefined') el.remove();
				if (typeof($('latex_use_keywords').html()) != 'undefined') {
					root.latex.use_keywords = 1;
					$('latex_use_keywords').remove();
				}
			}
			if (typeof($('log_cls').html()) != 'undefined') {
				if ($('log_cls').html() != '') root.latex.cls = $('log_cls').text();
			}
			$('log_id,log_date,log_update,log_mtime,log_lang_alt,log_author,log_category,log_category_caption,log_tags,log_desc,log_cls,cite_year,cite_doi,cite_contrib').remove();
		}
	},
	cmd : {
		id: 'MATERRA',
		last: [],
		last_idx: -1,
		last_total: 0,
		current: '',
		args: [],
		args_all: '',
		cmd: '',
		active_dir: '\\'.hashCode(),
		root_hash: '\\'.hashCode(),
		active_dir_str: '\\',
		active_dir_level: 'h2',
		input_redirect: '',
		input_redirect_append: '',
		output_redirect: '',
		output_redirect_append: '',
		//id: 'homo',
		//classname: 'default',
		//separator: true,
		//autobottom: true,
		//window: 0,
		//view: 0,
		//queue_cmds: [],
		local: {
			id: { val: '', ph: '', 'default': 'homo' },
			classname: { val: '', 'default': 'default'},
			separator: { val: true, 'default': true },
			autobottom: { val: true, 'default': true },
			window: { val: 0, 'default': 0 },
			view: { val: 0, 'default': 0 },
			echo: { val: true, 'default': true, desc: 'suppress echo output' },
			latex: { graphics_path: { val: '', 'default': '' } },
			man: {
				enabled: { val: true, 'default': true },
				delay: { val: 0, 'default': 11 },		// affects how long the text MATERRA says will be shown
				ext_delay: { val: 0, 'default': 88 }	// if input text ends with newline (\n), the delay is extended - multiplied by this number
			},
			idle_time: { val: 0, 'default': 333666 },
			prompt: { val: '', 'default': 'C:', onchange: function() { root.cmd.setPrompt(this.val); } },
			prompt_system: { val: '', 'default': 'MATERRA:', onchange: function() { root.cmd.setPrompt(this.val, 0); } },
			play_dir: { val: '', 'default': 'file:///D:/MUSIC/mp3/', desc: 'default path (local or remote) for media files, used by <b>play</b> command' },
			playlist: { val: '', 'default': '.media_playlist', type: 'audio', shuffle: true, desc: 'media playlist used by <b>play</b> command, can be an element containing the playlist in plain text format (m3u,txt) or URL (works only if URL is at the same domain or if Cross-Origin requests are enabled at URL)' },
			autorun: ['set autobottom false', 'dir', 'restore autobottom', 'check'],	// these commands are run on system boot, but only if queue is empty
			queue_cmds: []	// holds queued commands, run on boot, idlemaster init, or by RUN cmd (survives system restarts, as all the above)
		},
		local_desc: {	// descriptions for non-object vars
			'autorun': 'commands to run on boot, but only if queue is empty',
			'queue_cmds': 'holds queued commands, to run on boot, idlemaster init, or by RUN cmd'
		},
		locked: [],
		question: null,
		question_timeout: null,
		el_system: null,
		el: null,
		el_fallback: null,
		elements: [],
		timeout: null,
		cleartimeout: null,
		typestr: '',
		typestr_max_length: 140,
		no_run: false,
		no_permanent: false,
		playlist: { entities: [], idx: 0, total: 0, getMediaType: function(content) { if (content.match(/\.(mp3|mp2|m4a|mpa|midi|mka|mod|ogg|oga|wav|wma|flac|cue[\:0-9]*)$/i)) return 'audio'; return 'video'; } },
		reverse: {
			val: false,
			delay: {
				val: 999,
				old: null,
				'default': 999,
				'final': 3333
			}
		},
		setOld: function(obj) {
			var theobj;
			if (typeof(obj) == 'object')
				theobj = obj;
			else
				theobj = this.local[obj];
			for (var o in theobj)
				if (typeof(theobj[o]) == 'object' && theobj[o] !== null) this.setOld(theobj[o]);
			if (typeof(theobj.val) != 'undefined')
				theobj.old = theobj.val;
		},
		restoreOld: function(obj) {
			var theobj;
			if (typeof(obj) == 'object')
				theobj = obj;
			else
				theobj = this.local[obj];
			for (var o in theobj)
				if (typeof(theobj[o]) == 'object' && theobj[o] !== null) this.setOld(theobj[o]);
			if (typeof(theobj.old) != 'undefined') {
				var tmp = theobj.val;
				theobj.val = theobj.old;
				theobj.old = tmp;
			}
		},
		slashEscape: function(contents) {
			//return contents.replace(/\n/g, '');
		},
		adjustCmdWindow: function() {
			$(this.elements).each(function(idx) {
				root.cmd.elements[idx].width($('#cmd > .cmd[for="cmd'+idx+'"]').width() - ($('#cmd > .cmd[for="cmd'+idx+'"] > label').width() + 18));
			});
			this.adjustTypestrMaxLength();
		},
		setPrompt: function(str, idx=1) {
			if (typeof(this.elements[idx]) == 'undefined') return;
			$('#cmd > .cmd[for="cmd'+idx+'"] > label').html(str+(str.charAt(str.length-1)=='\\'?'':'&nbsp;'));
			this.elements[idx].width($('#cmd > .cmd[for="cmd'+idx+'"]').width() - ($('#cmd > .cmd[for="cmd'+idx+'"] > label').width() + 18));
		},
		getSubDirLevel: function(level = false) {
			if (level === false) level = this.active_dir_level;
			switch (level) {
				case 'h5': return 'h4';
				case 'h4': return 'h3';
				default: return 'h2';
			}
		},
		getNextDirLevel: function(level = false) {
			if (level === false) level = this.active_dir_level;
			switch (level) {
				case 'h2': return 'h3';
				case 'h3': return 'h4';
				default: return 'h5';
			}
		},
		getSubDir: function(dir_hash) {		// returns subdir hash
			if (dir_hash == this.root_hash) return dir_hash;
			let i, subh = 'h3', idx = $(this.getSubDirLevel()+'[hash="'+dir_hash+'"]').attr('idx').split('.');
			if (idx[2] != '0') idx[2] = '0';
			else if (idx[1] != '0') {
				idx[1] = '0';
				subh = 'h2';
			}
			else return this.root_hash;
			idx = idx[0]+'.'+idx[1]+'.'+idx[2];
			this.active_dir_level = subh;
			return $(subh+'[idx="'+idx+'"]').attr('hash');
		},
		activateDir: function(dir_hash) {
			if (this.active_dir_level == 'h5') return false;
			this.active_dir = dir_hash;
			if (dir_hash == this.root_hash) {
				this.active_dir_level = 'h2';
				this.active_dir_str = '\\';
				return this.setPrompt(this.local.prompt.val);
			}
			let el = $(this.active_dir_level+'[hash="'+dir_hash+'"]');
			if (typeof($('body div.expander[idx="'+el.attr('idx')+'"]').html()) != 'undefined' && $('body div.expander[idx="'+el.attr('idx')+'"]').attr('state') == 0) {
				let $this = $('body div.expander[idx="'+el.attr('idx')+'"]');
				$this.trigger('click');
				let max_loops = 5;
				while (typeof($this = $this.closest('div.spirit')) != 'undefined' && max_loops-- > 0) {
					$this = $this.prev('div.expander');
					if (typeof($this) != 'undefined' && $this.attr('state') == 0)
						$this.trigger('click');
					else break;
				}
			}
			el.scrollToMe();
			let idx = el.attr('idx').split('.');
			let idx_len = idx.length, dir_str = '\\', i;
			let x = Number(idx[0])-1;
			dir_str += root.summary.entities[x].title.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2);
			if (typeof(idx[1]) != 'undefined' && idx[1] != 0) {
				dir_str += '\\'+root.summary.entities[x].entities[Number(idx[1])-1].title.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2);
				if (typeof(idx[2]) != 'undefined' && idx[2] != 0) {
					dir_str += '\\'+root.summary.entities[x].entities[Number(idx[1])-1].entities[Number(idx[2])-1].title.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2);
					if (typeof(idx[3]) != 'undefined' && idx[3] != 0 && idx[3].match(/^[0-9]+$/))
						dir_str += '\\'+root.summary.entities[x].entities[Number(idx[1])-1].entities[Number(idx[2])-1].entities[Number(idx[3])-1].title.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2);
				}
			}
			/*
			let el = root.summary;
			for (i=0; i<idx_len; i++) {
				el = el.entities[idx[i]-1];
				dir_str += '/'+el.title.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2);
			}*/
			this.active_dir_level = this.getNextDirLevel();
			this.active_dir_str = dir_str;
			this.setPrompt(this.local.prompt.val+dir_str+'\\');
		},
		updateDir: function() {
			//let el = $(this.getSubDirLevel()+'[hash="'+this.active_dir+'"]');
			let dirs = this.active_dir_str.split('\\'), tmp_dirs;
			this.cmds.cd.exec('\\');
			let dirs_len = dirs.length, i;
			for (i=0; i<dirs_len; i++) {
				this.cmds.cd.exec(dirs[i], true);
				tmp_dirs = this.active_dir_str.split('\\')
				if (typeof tmp_dirs[i] == 'undefined') return;
			}
		},
		setDefaults: function(where = false) {
			if (!where) where = this.local;
			Object.keys(where).forEach(function(key,index) {
				if (typeof(where[key]) != 'object') return;
				if (typeof(where[key].val) != 'undefined') {
					where[key].val = where[key].default;
					if (typeof(where[key].onchange) != 'undefined') where[key].onchange();
				}
				else
					root.cmd.setDefaults(where[key]);
			});
		},
		clear: function(idx=1) {
			if (!this.timeout)
				this.elements[idx].val('');
			else
				this.cleartimeout = setTimeout(this.clear.bind(this, idx), Math.floor(Math.random() * Math.floor(this.local.man.delay.val/3)));
		},
		idlemaster: {
			timeout: null,
			notified: false,
			run: function() {
				if (!this.notified) {
					root.cmd.say('Idling capacity reached.. igniting omega engine..', false, false, false);	// say() triggers input() and, consequently, the run of queued cmds
					this.notified = true;
				}
				if (root.cmd.timeout !== null) {
					setTimeout(root.cmd.idlemaster.run.bind(root.cmd.idlemaster), Math.floor(Math.random() * Math.floor(root.cmd.local.man.delay.val)));
					return;
				}
				clearTimeout(this.timeout);
				this.timeout = null;
				this.notified = false;
				root.quotes.init();
			}
		},
		lock: function() {
			if (this.question === null)
				this.el.prop('disabled', true);
		},
		unlock: function() {
			this.el.prop('disabled', false);
		},
		eval: function(code) {
			return Function('"use strict";return (' + code + ')')();
		},
		parse: function(str) {
			str = this.decode(str);
			/*
			var tmp = str.split(/\s+/), out = '';
			$(tmp).each(function (idx) {
				if (this.match(/^["'].*["']$/) || this.indexOf('.') < 0)
					out += this;
				else
					out += eval('`${'+this+'}`');
				out += ' ';
			});
			out = out.trim();
			return out;*/
			return eval('`'+str+'`');
		},
		say: function(code = false, codefinal = false, nocheck = false, closequotes = true) {
			if (!nocheck && this.timeout !== null) {
				setTimeout(this.say.bind(this, code, codefinal), this.local.man.delay.val);
				return;
			}
			else if (nocheck)
				clearTimeout(this.timeout);
			if (closequotes) root.quotes.close(true);		// Stop idlemaster showing quotes
			this.reverse.delay.old = null;
			if (codefinal !== false) {
				this.reverse.delay.old = this.reverse.delay.val;
				this.reverse.delay.val = ($.isNumeric(codefinal)?codefinal:this.reverse.delay.final);
				this.el.focus();
				setTimeout(function() { root.cmd.el_fallback.focus(); }, 2300);		// fix for Chrome
			}
			this.no_run = true;
			this.no_permanent = true;
			this.el_system.val('');
			this.input((code?this.parse(code):this.parse('Hello ${root.cmd.local.id.val} &#9786;')));
		},
		ask: function(input, callback, timeout = false, callback_on_timeout = false) {	// asks for input, answer sent to callback, question expires after timeout if specified and sends false to callback if callback_on_timeout
			if (this.question !== null) {
				setTimeout(root.cmd.ask.bind(this, input, callback, timeout, callback_on_timeout), 300);
				return;
			}
			this.question = callback;
			if (timeout !== false)
				this.question_timeout = setTimeout((callback_on_timeout?function() { root.cmd.question(false); root.cmd.question = null; root.cmd.question_timeout = null; }:function () { root.cmd.question = null; root.cmd.question_timeout = null; }), timeout);
			this.el.focus();
			setTimeout(function() { root.cmd.el_fallback.focus(); }, 2300);		// fix for Chrome
			this.say(input, (timeout!==false?timeout:true), true);
		},
		encode: function(str) {
			var buf = [];					
			for (var i=str.length-1;i>=0;i--)
				buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
			return buf.join('');
		},
		decode: function(str) {
			return str.replace(/&#(\d+);/g, function(match, dec) {
				return String.fromCharCode(dec);
			});
		},
		adjustTypestrMaxLength: function() {
			this.typestr_max_length = this.el_system.getCharWidth();
		},
		typecode: function() {
			if (this.typestr.length) {
				var x, myRegexp, match, delay = this.local.man.delay.val;
				delay = Math.floor(Math.random() * Math.floor(delay));
				if (this.reverse.val) {
					this.el_system.val(this.typestr.substring(0,this.typestr.length - 2));
					this.typestr = this.typestr.substring(0,this.typestr.length - 2);
				}
				else {
					x = 1;
					/*
					myRegexp = /^(&#[0-9a-z]+;)/i;
					match = myRegexp.exec(this.typestr);
					if (match !== null && typeof(match[1]) != 'undefined') x = match[1].length;*/
					if (this.typestr.substring(0,x).match(/\n$/)) {			// if typestr (code supplied to 'say') ends with \n we extend the delay (show text for longer time)
						delay = this.local.man.delay.val*this.local.man.ext_delay.val;
						this.typestr.replace(/\n$/, '');
					}
					this.el_system.val(this.el_system.val() + this.typestr.substring(0,x));
					if (this.no_run && this.el_system.val().length > this.typestr_max_length) {
						this.el_system.val(this.el_system.val().substring(1));
					}
					//this.el_system.val(this.decode(this.el_system.val()));
					this.typestr = this.typestr.substring(x);
				}
				this.el_system.trigger('change');
				this.timeout = setTimeout(this.typecode.bind(this), delay);
			}
			else if (this.no_permanent && !this.reverse.val) {
				this.reverse.val = true;
				this.typestr = this.el_system.val();
				this.timeout = setTimeout(this.typecode.bind(this), Math.floor(Math.random() * Math.floor(this.reverse.delay.val)));
				if (this.reverse.delay.old !== null) this.reverse.delay.val = this.reverse.delay.old;
			}
			else {
				this.reverse.val = false;
				this.no_permanent = false;
				this.timeout = null;
				if (!this.no_run)
					this.run(0);
				this.no_run = false;
				this.input();
			}
		},
		/* NOTE: queued commands are run in FIFO order */
		queue: function(code) {
			this.local.queue_cmds.push( { cmd: code } );
		},
		set: function(code) {
			let cur_code = code;
			//code = code.replace(/^what(\s+i|\')s\b/i, 'define');		// We're gonna reserve "what's" for talking..
			if (code.match(/^what\s+is\b/)) {
				this.cmds.define.setup_vars.what_is = true;
				code = code.replace(/^what\s+is/i, 'define');
			}
			this.output_redirect = ''; this.output_redirect_append = '';
			this.input_redirect = ''; this.input_redirect_append = '';
			var myRegexp = /^(.*)\>\>([^\>]+)$/;
			match = myRegexp.exec(code);
			if (match !== null && typeof(match[2]) != 'undefined') {
				match[2] = match[2].trim();
				if (match[2].split('"').length <= 1 && match[2].split("'").length <= 1) {
					code = match[1];
					this.output_redirect_append = match[2];
				}
			}					
			else {
				myRegexp = /^(.*)\>([^\>]+)$/;
				match = myRegexp.exec(code);
				if (match !== null && typeof(match[2]) != 'undefined') {
					match[2] = match[2].trim();
					if (match[2].split('"').length <= 1 && match[2].split("'").length <= 1) {
						code = match[1];
						this.output_redirect = match[2];
					}
				}
			}
			myRegexp = /^(.*)\<\<([^\<]+)$/;
			match = myRegexp.exec(code);
			if (match !== null && typeof(match[2]) != 'undefined') {
				match[2] = match[2].trim();
				if (match[2].split('"').length <= 1 && match[2].split("'").length <= 1) {
					code = match[1];
					this.input_redirect_append = match[2];
				}
			}					
			else {
				myRegexp = /^(.*)\<([^\<]+)$/;
				match = myRegexp.exec(code);
				if (match !== null && typeof(match[2]) != 'undefined') {
					match[2] = match[2].trim();
					if (match[2].split('"').length <= 1 && match[2].split("'").length <= 1) {
						code = match[1];
						this.input_redirect = match[2];
					}
				}
			}
			this.args = code.split(/\s+/);
			this.cmd = this.args[0].toLowerCase();
			if (this.args[0].indexOf('.') >= 0) {
				var tmp = this.args[0].split('.');
				this.cmd = tmp[0];
				this.local.classname.val = tmp[1];
			}
			this.args_all = '';
			if (code.trim().match(/\s+/))
				this.args_all = code.replace(/^[^\s]+\s+(.*)$/, '$1').trim();
			if (this.args_all == '' && typeof(this.cmds[this.cmd]) != 'undefined' && typeof(this.cmds[this.cmd].required) != 'undefined')
				return false;
			this.current = cur_code;
			return true;			
		},
		input: function(code = false) {
			this.unlock();
			var code_supplied = code;
			if (!code) {
				if (this.local.queue_cmds.length > 0) {
					root.storeLocal('queue_cmds', this.local.queue_cmds);
					code = this.local.queue_cmds.shift().cmd;
				}
				else {
					root.removeLocal('queue_cmds');
					return;
				}
			}
			this.set(code);
			if (this.local.man.enabled.val || this.no_run) {
				//console.log('TYPING, MAN_ENABLED = '+this.local.man.enabled.val+', NO_RUN = '+this.no_run);
				this.lock();
				this.typestr = code;
				this.typecode();
			}
			else {
				this.el_system.val(code);
				this.run(0);
				if (!code_supplied) this.input();
			}
		},
		cmds: {
			'about': {
				desc: 'information about the system',
				exec: function() {
					var out = '<b>'+root.id+'</b>'+"\n\n"+root.about+(root.alienized?'<br><br>\tFor those about to rock,<div class="right">We salute you</div>':'');
					root.cmd.cmds.div.exec(out.HTMLize());
					return true;
				}
			},
			'alienize': {
				desc: 'switch the environment to a <em>special</em> dark theme',
				exec: function() {	// TODO: make dark theme
					//$('html, body, .cmd > label, .cmd > input').css({ 'background-color': '#000', color: '#00B95C', 'letter-spacing': '2px', 'font-family': "'City-Light-Light'" });
					document.querySelector('html').style.setProperty('--my-color-white', '#000');
					//document.querySelector('html').style.setProperty('--my-color-menucaption', '#d7c065');
					document.querySelector('html').style.setProperty('--my-color-black', '#00B95C');
					document.querySelector('html').style.setProperty('--my-color-input', '#00B95C');
					document.querySelector('html').style.setProperty('--my-letter-spacing', '2px');
					document.querySelector('html').style.setProperty('--my-font-family', "'City-Light-Light'");
					document.querySelector('html').style.setProperty('--my-body-family', "'City-Light-Light'");
					document.querySelector('html').style.setProperty('--my-body-title-family', "'City-Light-Light'");
					//$('img, span, .synonyms, .song, .info_bar, div[timerel]').css({ '-webkit-filter': 'invert(1)', filter: 'invert(1)' });
					document.querySelector('html').style.setProperty('--my-filter', 'invert(1)');
					//$('span.fig, .synonyms, .song, .info_bar, div[timerel], .MathJax_CHTML').css({ color: '#454545' });
					document.querySelector('html').style.setProperty('--my-color-figures', '#454545');
					//$('p.equation, p.equation span').css({ '-webkit-filter': 'none', filter: 'none', color: 'white' });
					document.querySelector('html').style.setProperty('--my-color-equation', 'white');
					//$('div[timerel] p.equation, div[timerel] p.equation span').css({ color: 'black' });
					document.querySelector('html').style.setProperty('--my-color-equation-inverse', 'black');
					//$('.spirit table tr:nth-child(2n)').css({ 'background-color': '#151515' });
					document.querySelector('html').style.setProperty('--my-color-lightgrey', '#151515');
					//$('.spirit table tr td, .spirit table tr th').css({ 'border': '1px solid #333333' });
					document.querySelector('html').style.setProperty('--my-border-lightgrey', '1px solid #333333');
					//$('.mark').css({ 'background-color': '#333333' });
					document.querySelector('html').style.setProperty('--my-color-grey', '#333333');
					//$('html, body, .window').css({ 'scrollbar-color': '#333333 #151515' });
					document.querySelector('html').style.setProperty('--my-scrollbar-color', '#333333 #151515');
					//$('a').css({ color: '#757575' });
					document.querySelector('html').style.setProperty('--my-color-blue', '#757575');
					document.querySelector('html').style.setProperty('--my-heading-text-transform', 'uppercase');
					document.querySelector('html').style.setProperty('--my-filter-desc', 'blur(0.6px)');
					document.querySelector('html').style.setProperty('--my-display-alien-hide', 'none');
					document.querySelector('html').style.setProperty('--my-display-alien-show', 'block');
					root.alienized = true;
					//root.cmd.queue('set prompt_system "MUTHUR:\\\\"');
					root.cmd.queue('set prompt_system "MUTHUR:"');
					root.cmd.input();
					return false;
				}
			},
			'bottom': {
				desc: 'scroll to bottom of the output window',
				exec: function() {
					if (root.cmd.cmd == 'set' && root.cmd.args[2]) return false;
					//$('.bottom', root.wins.wins[root.cmd.local.window.val]).remove();
					//var el = $('<div class="bottom"></div>');
					//root.wins.wins[root.cmd.local.window.val].append(el);
					$('#window'+root.cmd.local.window.val).scrollToBottom('#window'+root.cmd.local.window.val);
					return false;
				}
			},
			'buildref': {
				desc: '(re)builds references',
				exec: function() {
					root.unbuildReferences();
					root.buildReferences();
					root.cmd.say('Done.');
					return false;
				}
			},
			'cd': {
				title: 'CD chapter',
				desc: 'change current chapter to <em>chapter</em><br>if <em>chapter</em> doesn\'t exist, will load a webpage with the provided title if it exists',
				examples: ['cd neurogenesis', 'cd neuro*', 'cd ..'],
				exec: function(val = false, silent = false) {
					if (val === false) val = root.cmd.args_all;
					if (val == '' || val == '.') return false;
					if (val.match(/\$\{[^\}]+\}/)) {
						try {
							val = root.cmd.parse(val);
						}
						catch (error) { if (!silent) root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false; }
					}
					else {
						try {
							val = Function('"use strict";return (' + val + ')')();
						}
						catch (error) { 
							// pass it on as string if it can't be evaluated, rather than throwing err
							/*root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false;*/
						}
					}
					if (val.match(/^\.\./)) {
						val = val.replace(/^\.\./, '');
						root.cmd.activateDir(root.cmd.getSubDir(root.cmd.active_dir));
						return root.cmd.cmds.cd.exec(val);
					}
					let dir_hash = val.toLowerCase().hashCode();
					if (val.indexOf('*') >= 0 && typeof($(root.cmd.active_dir_level+'[hash="'+dir_hash+'"]').html()) == 'undefined') {
						var myRegexp = new RegExp(val, 'i');
						$(root.cmd.active_dir_level).each(function (idx) {
							if (myRegexp.exec($(this).html()) !== null) {
								val = $(this).html().replace(/^\<span\>[0-9\.]+\<\/span\>\s*/, '');
								dir_hash = val.toLowerCase().hashCode();
								return false;	// break
							}
						});
					}				
					console.log('TRYING_DIR (val='+val.toLowerCase()+'):'+root.cmd.active_dir_level+'[hash="'+dir_hash+'"]');
					if (dir_hash == root.cmd.root_hash || typeof($(root.cmd.active_dir_level+'[hash="'+dir_hash+'"]').html()) != 'undefined')
						root.cmd.activateDir(dir_hash);
					else {
						if (val.indexOf('\\') >= 0) {
							val = val.replace(/^\\+/, '');
							let first_dir = val.replace(/^([^\\]+)\\.*$/, '$1');
							dir_hash = first_dir.toLowerCase().hashCode();
							if (dir_hash == root.cmd.root_hash || typeof($(root.cmd.active_dir_level+'[hash="'+dir_hash+'"]').html()) != 'undefined') {
								root.cmd.activateDir(dir_hash);
								if (val.indexOf('\\') >= 0)
									return root.cmd.cmds.cd.exec(val.replace(/^([^\\]+)\\/, ''));
								return false;
							}
						}
						let tmp = root.menu.getItemURL(val);
						if (tmp !== null) return root.cmd.cmds.load.exec(tmp);
						if (!silent) root.cmd.say('Sorry '+root.cmd.local.id.val+', there is no such chapter in the current one.');
					}
					return false;
				}
			},
			'chlog': {
				desc: 'shows change log of MATERRA',
				exec: function() {
					return root.updates.chlog();
				}
			},
			'check': {
				desc: 'check for updates',
				exec: function() {
					return root.updates.check();
				}
			},
			'cls': {
				desc: 'clear the output window',
				exec: function() {
					root.views.clear();
					return false;
				}
			},
			'create': {
				title: 'CREATE title',
				required: 'Please enter title.',
				desc: 'create a new chapter and set its title to <em>title</em>',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					val = val.replace(/\\/g, '');
					if (val.length < 1) {
						root.cmd.say('Please provide the title for a new chapter.');
						return false;
					}
					let title_hash = val.toLowerCase().hashCode();
					if (typeof $('body '+root.cmd.active_dir_level+'[hash="'+title_hash+'"]').html() != 'undefined') {
						root.cmd.say('That chapter already exists.');
						return false;
					}
					/*if (!root.editable.edit_mode) {
						root.editable.edit_mode = true;
						root.spirits.makeEditable();
					}*/
					let el = false;
					if (root.cmd.active_dir != root.cmd.root_hash) { 
						el = $('body '+root.cmd.getSubDirLevel()+'[hash="'+root.cmd.active_dir+'"]');
						if (typeof el.html() == 'undefined') el = false;
						else if (typeof el.parent().next('.spirit_actions').html() != 'undefined') el = el.parent().next('.spirit_actions');
						else el = el.parent();
					}
					root.spirits.createSpirit(el, root.cmd.active_dir_level, 'local', val).scrollToMe();
					return false;
				}
			},
			'define': {
				/* silent = return results */
				title: 'DEFINE entity',
				required: 'What should I define?',
				desc: 'show definition of <em>entity</em>',
				examples: ['define prophecy'],
				setup_vars: {
					what_is: false
				},
				exec: function(what = false, silent = false, only_first = false, only_defs = true, explain = false) {
					if (what === false) what = root.cmd.args_all;
					let whatis = this.setup_vars.what_is;
					this.setup_vars.what_is = false;
					var $this, $this2, $this3, tmp, results = [], results_nonstrict = [], strict_found = false;
					what = what.toLowerCase();
					var	out = '', parent_res;
					what = what.replace(/\s*[^a-z0-9]+$/i, '');
					if (root.summary.entities.length < 1)
						root.summary.build();
					var cur_summary, cur_hash, used_hashes = {};
					$(Object.keys(root.memory.summaries)).each(function (index) {
						strict_found = false;
						cur_hash = this;
						cur_summary = root.memory.summaries[cur_hash];
						$(cur_summary).each(function(idx) {
							if (!only_defs || (typeof(this.class) != 'undefined' && this.class == 'definitions')) {
								$this = this;
								if (!only_defs) {
									$this.page_hash = cur_hash;
									parent_res = null;
									$(this.synonyms).each(function(idx3) {
										tmp = what.compareTo(this);
										if (tmp > 0) {
											//$this.parent_idx = '';
											$this.matchscore = tmp;
											if (tmp >= 1) {
												used_hashes[cur_hash] = 1;
												results.push($this);
												strict_found = true;
												return false;
											}
											used_hashes[cur_hash] = 1;
											results_nonstrict.push($this);
											parent_res = this;
										}
									});
									tmp = what.compareTo(this.title);
									if (tmp > 0) {
										//this.parent_idx = '';
										this.matchscore = tmp;
										this.page_hash = cur_hash;
										if (tmp >= 1) {
											used_hashes[cur_hash] = 1;
											results.push(this);
											strict_found = true;
											return false;
										}
										used_hashes[cur_hash] = 1;
										results_nonstrict.push(this);
										parent_res = this.title;
									}
									if (strict_found) return false;
								}
								$(this.entities).each(function(idx2) {
									$this2 = this;
									$this2.page_hash = cur_hash;
									parent_res = null;
									if (!only_defs || typeof(this.def) != 'undefined') {
										$(this.synonyms).each(function(idx3) {
											tmp = what.compareTo(this);
											if (tmp > 0) {
												$this2.parent_idx = $this.idx;
												$this2.matchscore = tmp;
												if (tmp >= 1) {
													used_hashes[cur_hash] = 1;
													results.push($this2);
													strict_found = true;
													return false;
												}
												used_hashes[cur_hash] = 1;
												results_nonstrict.push($this2);
												parent_res = this;
											}
										});
										tmp = what.compareTo(this.title);
										if (tmp > 0) {
											this.parent_idx = $this.idx;
											this.matchscore = tmp;
											this.page_hash = cur_hash;
											if (tmp >= 1) {
												used_hashes[cur_hash] = 1;
												results.push(this);
												strict_found = true;
												return false;
											}
											used_hashes[cur_hash] = 1;
											results_nonstrict.push(this);
											parent_res = this.title;
										}
									}
									if (strict_found) return false;
									$(this.entities).each(function(idx3) {
										if (!only_defs || typeof(this.def) != 'undefined') {
											$this3 = this;
											$this3.page_hash = cur_hash;
											$(this.synonyms).each(function(idx4) {
												tmp = what.compareTo(this);
												if (tmp > 0) {
													$this3.parent_parent_idx = $this.idx;
													$this3.parent_idx = $this2.idx;
													$this3.matchscore = tmp;
													if (tmp >= 1) {
														used_hashes[cur_hash] = 1;
														results.push($this3);
														strict_found = true;
														return false;
													}
													if (parent_res !== null) {
														tmp = what.compareTo(parent_res+' '+this);
														if (tmp > $this3.matchscore)
															$this3.matchscore = tmp;
														if (tmp >= 3/4) {	// ignoring influence of short words ('of', 'a'..)
															$this2.matchscore = tmp;
															if (only_first) {
																used_hashes[cur_hash] = 1;
																results.push($this3);
																//results.push($this2);
															}
															else {
																used_hashes[cur_hash] = 1;
																results.push($this2);
																results.push($this3);
															}
															strict_found = true;
															return false;
														}
													}
													used_hashes[cur_hash] = 1;
													results_nonstrict.push($this3);
												}
											});
											tmp = what.compareTo(this.title);
											if (tmp > 0) {
												this.parent_parent_idx = $this.idx;
												this.parent_idx = $this2.idx;
												this.matchscore = tmp;
												this.page_hash = cur_hash;
												if (tmp >= 1) {
													used_hashes[cur_hash] = 1;
													results.push(this);
													strict_found = true;
													return false;
												}
												if (parent_res !== null) {
													tmp = what.compareTo(parent_res+' '+this.title);
													if (tmp > this.matchscore)
														this.matchscore = tmp;
													if (tmp >= 3/4) {
														$this2.matchscore = tmp;
														if (only_first) {
															used_hashes[cur_hash] = 1;
															results.push(this);
															//results.push($this2);
														}
														else {
															used_hashes[cur_hash] = 1;
															results.push($this2);
															results.push(this);
														}
														strict_found = true;
														return false;
													}
												}
												used_hashes[cur_hash] = 1;
												results_nonstrict.push(this);
											}
										}
									});
									if (strict_found) return false;
								});
							}
							if (strict_found) return false;
						});	// END SUMMARY LOOP
					});	// END root.memory.summaries LOOP
					//console.log('RESULTS = '+JSON.stringify(results));
					//console.log('RESULTS_PARTIAL = '+JSON.stringify(results_nonstrict));
					var print_pages = (Object.keys(used_hashes).length > 1?true:false);
					if (results.length < 1) {
						if (results_nonstrict.length < 1) {
							if (silent) return false;
							if (whatis) return root.cmd.cmds.talk.exec();
							out = 'I do not know how to define that. You can try visiting more pages so I can learn.';
							root.cmd.say(out);
							return false;
						}
						else {
							results_nonstrict.sort((a,b) => (a.matchscore < b.matchscore) ? 1 : ((b.matchscore < a.matchscore) ? -1 : 0));
							if (silent) return (only_first?results_nonstrict[0]:results_nonstrict);
							out = 'No strict matches found. Found <b>'+results_nonstrict.length+'</b> partial matches:<br>';
							$(results_nonstrict).each(function(idx) {
								console.log('SCORE = '+this.matchscore);
								tmp = this.title;
								if (this.synonyms.length > 0) {
									$(this.synonyms).each(function(idx2) {
										tmp += ' = '+this;
									});
								}
								out += '<div><div class="title">'+(typeof(this.parent_parent_idx) != 'undefined'?this.parent_parent_idx+'.':'')+this.parent_idx+'.'+this.idx+' '+tmp+(print_pages?' (in <span title="'+root.memory.pages[this.page_hash].title.htmlentities()+'">'+root.memory.pages[this.page_hash].title.abbreviation()+'</span>)':'')+'</div>'+this.def.markKeywords(what)+(explain&&(typeof(this.explain)!='undefined')?'<br><br>'+this.explain.markKeywords(what):'')+'</div>';
								if (only_first) return false;	// break
							});
						}
					}
					else {
						results.sort((a,b) => (a.matchscore < b.matchscore) ? 1 : ((b.matchscore < a.matchscore) ? -1 : 0));
						if (silent) return (only_first?results[0]:results);
						$(results).each(function(idx) {
							console.log('SCORE = '+this.matchscore);
							tmp = this.title;
							if (this.synonyms.length > 0) {
								$(this.synonyms).each(function(idx2) {
									tmp += ' = '+this;
								});
							}
							//console.log('THIS_OBJ:', this);
							out += '<div><div class="title">'+(typeof(this.parent_parent_idx) != 'undefined'?this.parent_parent_idx+'.':'')+this.parent_idx+'.'+this.idx+' '+tmp+(print_pages?' (in <span title="'+root.memory.pages[this.page_hash].title.htmlentities()+'">'+root.memory.pages[this.page_hash].title.abbreviation()+'</span>)':'')+'</div>'+this.def.markKeywords(what)+(explain&&(typeof(this.explain)!='undefined')?'<br><br>'+this.explain.markKeywords(what):'')+'</div>';
							if (only_first) return false;	// break
						});																
					}
					var old = root.cmd.local.classname.val;
					root.cmd.local.classname.val = 'def';
					root.cmd.cmds.div.exec(out);
					root.cmd.local.classname.val = old;
					return true;
				}
			},
			'del': {
				title: 'DEL title',
				required: 'Please enter title.',
				desc: 'deletes a local web page',
				examples: ['del CO_2 bubble'],
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					val = val.replace(/\\/g, '').express();
					if (val.length < 1) {
						root.cmd.say('Please provide the title.');
						return false;
					}
					root.webpages.remove_local(val);
					return false;
				}
			},
			'dir': {
				title: 'DIR [/S]',
				desc: 'builds summary (index) of contents of the current page and prints it to the output window.<br>/S - expand the list',
				exec: function() {
					if (root.cmd.args_all.match(/\/S/i))
						root.summary.params.expand_all.val = true;
					root.summary.build();
					root.summary.buildHTML(root.cmd.local.view.val);
					//root.summary.params.expand_all.val = root.summary.params.expand_all.default;
					root.cmd.setDefaults(root.summary.params);
					return true;
				}
			},
			'div': {
				title: 'DIV<em>[.classname]</em> content',
				desc: 'HTML &lt;DIV class="<em>classname</em>"&gt;<em>content</em>&lt;/DIV&gt; tag',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					let el = $('<div'+(root.cmd.local.classname.val!=''?' class="'+root.cmd.local.classname.val+'"':'')+'>'+val+'</div>');
					let id = root.views.append(el);
					//MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $('div#view'+id)[0]]);
					MathJax.Hub.Queue(["Typeset", MathJax.Hub, $('div#view'+id+'> div:last-of-type')[0]]);
				}
			},
			'doc': {
				title: 'DOC',
				desc: 'loads documentation',
				exec: function() {
					root.load('/documentation.html');
					return false;
				}
			},
			'echo': {
				title: 'ECHO output',
				desc: 'print <em>output</em> to the output window',
				examples: ['echo "Hello"', 'echo Hi ${root.cmd.local.id.val}'],
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if (root.cmd.local.echo.val) {
						if (val.match(/^true$/i))
							val = true;
						else if (val.match(/^false$/i))
							val = false;
						else if (val.match(/^[0-9\.]+$/i))
							val = Number(val);
						else {
							if (val.match(/\$\{[^\}]+\}/)) {
								try {
									val = root.cmd.parse(val);
								}
								catch (error) { root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false; }
							}
							else {
								try {
									val = Function('"use strict";return (' + val + ')')();
								}
								catch (error) { root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false; }
							}
						}
						root.views.append(val.HTMLize());
					}
				}
			},
			'edit': {	// TODO: bad stuff if summary is built, make summary.unbuild()
				title: 'EDIT [title|index|off]',
				desc: 'turns edit mode on and edits chapter if specified by <em>title</em> or <em>index</em><br>off - turns off edit mode<br><br>Note: changes on remote pages will be saved locally',
				examples: ['edit 4.2', 'edit existence of a single entity'],
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					if (content.match(/^off$/i)) {
						root.editable.edit_mode = false;
						root.spirits.unmakeEditable();
						return false;
					}
					if (!root.editable.edit_mode) {
						root.editable.edit_mode = true;
						root.spirits.makeEditable();
					}
					if (content.length > 0) {
						if (root.summary.entities.length < 1)
							root.summary.build();
						var el = root.summary.getSpirit(content);
						if (el !== false) {
							if (!root.editable.editable_js_loaded) {
								setTimeout(root.cmd.cmds.edit.exec.bind(this, content), 300);
								el.scrollToMe();
								return false;
							}
							el.focus();
							el.trigger('click');
						}
						else {
							root.cmd.say('Chapter not found.');
							return false;
						}
					}
					return false;
				}
			},
			'exit': {
				desc: 'close system windows',
				exec: function() {
					root.cmd.say('Goodbye '+root.cmd.local.id.val);
					root.memory.save_expander_states();
					clearTimeout(root.cmd.idlemaster.timeout);
					clearTimeout(root.cmd.timeout);
					$('.window, #cmd').remove();
					return false;
				}
			},
			'explain': {
				title: 'EXPLAIN entity',
				required: 'What should I explain?',
				desc: 'shows detailed description of <em>entity</em>',
				examples: ['explain prophecy'],
				exec: function(what = false) {
					//define(what = false, silent = false, only_first = false, only_defs = true, explain=false)
					return root.cmd.cmds.define.exec(what, false, false, true, true);
				}
			},
			'find': {
				title: 'FIND content',
				required: 'What do you want me to find?',
				desc: 'searches universes for <em>content</em>',
				exec: function() {
					//root.summary.build();
					root.cmd.say('Function not implemented.');
					return false;
				}
			},
			'hide': {
				desc: 'hide the command line interface (CLI), show only on hover',
				exec: function() {
					$('#cmd').addClass('hover');
					return false;
				}
			},
			/*
			'how': {			// We're gonna reserve it for talking
				desc: 'alias of <b>explain</b>',
				exec: function() {
					root.cmd.cmds.explain.exec();
				}
			},*/
			'hr': {
				desc: 'HTML &lt;DIV class="separator"&gt;&lt;/DIV&gt; tag',
				exec: function() {
					var el = $('<div class="separator"></div>');
					root.views.append(el);
					return false;
				}
			},
			'id': {
				title: 'ID [username]',
				desc: 'if <em>username</em> is specified, sets user id and prompt to <em>username</em>, otherwise shows current id',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if (val === false || val == '') {
						root.cmd.say('Your id is '+root.cmd.local.id.val+'.');
					}
					else if (val.match(/^[A-Za-z0-9\_]{3,16}$/)) {
						if (root.cmd.local.id.val != val) root.cmd.local.id.ph = '';
						root.cmd.local.id.val = val;
						root.cmd.say('Your new id is '+root.cmd.local.id.val+'.');
						root.storeLocal('id', JSON.stringify(root.cmd.local.id));
						root.cmd.local.prompt.val = val+':';
						root.storeLocal('prompt', JSON.stringify(root.cmd.local.prompt));
						if (typeof(root.cmd.local.prompt.onchange) != 'undefined')
							root.cmd.local.prompt.onchange();
						else
							root.cmd.setPrompt(root.cmd.local.prompt.val);
					}
					else root.cmd.say('Username must be 3-16 chars in length. Allowed characters are numbers, letters and underscore (_).');
					return false;
				}
			},
			'idle': {
				desc: 'run idlemaster engine',
				exec: function() {
					clearTimeout(root.cmd.idlemaster.timeout);
					root.cmd.idlemaster.timeout = null;
					root.cmd.idlemaster.run();
					return false;
				}
			},
			'latex': {
				title: 'LATEX [filename]',
				desc: 'generates a LaTeX source from the current page<br>if <em>filename</em> is specified, sets output file name to <em>filename</em>.tex, otherwise file name is autogenerated',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					root.latex.build(val);
					return false;
				}
			},
			'load': {
				title: 'LOAD url',
				required: 'What should I load?',
				desc: 'loads the specified webpage, use prefix <em>local:</em> for local web pages',
				examples: ['load /solar_system.html', 'load local:CO^2 bubble'],
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					val = val.makeFileName();
					root.load(val);
					return false;
				}
			},
			'log': {
				title: 'LOG title',
				required: 'Please enter title.',
				desc: 'create a new log web page and set its title to <em>title</em>',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					val = val.replace(/\\/g, '').express();
					if (val.length < 1) {
						root.cmd.say('Please provide the title.');
						return false;
					}
					root.webpages.create_local(val);
					if (typeof($('body > div.spirit.main_head').html()) == 'undefined') {
						root.spirits.createHeading(val);
						let el = false;
						if (root.cmd.active_dir != root.cmd.root_hash) { 
							el = $('body '+root.cmd.getSubDirLevel()+'[hash="'+root.cmd.active_dir+'"]');
							if (typeof el.html() == 'undefined') el = false;
							else if (typeof el.parent().next('.spirit_actions').html() != 'undefined') el = el.parent().next('.spirit_actions');
							else el = el.parent();
						}
						//createSpirit(after = false, heading_type = 'h2', addclass = '', caption='New', placeholder=true)
						let log_header = root.spirits.createSpirit(el, root.cmd.active_dir_level, 'local log_header', 'LOG_HEADER', false);
						let date = new Date(), dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
						let [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat.formatToParts(date);
						let log_header_str = '<log_id></log_id>\n<log_date>'+year+'.'+month+'.'+day+'</log_date>\n<log_update></log_update>\n<log_author>'+root.cmd.local.id.val+'</log_author>\n<log_desc></log_desc>\n<log_category>general</log_category>\n<log_tags></log_tags>\n<!-- KEYWORDS ARE CASE_SENSITIVE -->\n<log_keywords></log_keywords>';
						log_header.html(log_header.html()+log_header_str);
						root.webpages.save_local();
					}
					return false;
				}
			},
			'login': {
				title: 'LOGIN password',
				required: 'Please enter your password.',
				desc: 'log in to this website using your id and password',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if (val.match(/^[A-Za-z0-9\_]{3,16}$/)) {
						fetch('/users/users.php?cmd=login&id='+root.cmd.local.id.val+'&p='+val+'&rnd='+Math.floor(Math.random() * 1024000))
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('LOGIN.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									switch (data) {
										case '-1':
											root.cmd.say('Invalid id or password.');
											break;
										case '-2':
											root.cmd.say('The id "'+root.cmd.local.id.val+'" is not registered. Please register it first.');
											break;
										default: 
											if (data.length == 64) {
												root.cmd.local.id.ph = data;
												root.storeLocal('id', JSON.stringify(root.cmd.local.id));
												if (1) {
													root.cmd.local.prompt.val = root.cmd.local.id.val+':';
													root.storeLocal('prompt', JSON.stringify(root.cmd.local.prompt));
													if (typeof(root.cmd.local.prompt.onchange) != 'undefined')
														root.cmd.local.prompt.onchange();
													else
														root.cmd.setPrompt(root.cmd.local.prompt.val);
												}
												root.cmd.say('Login ok.');
											}
											else {
												root.cmd.say('Something went wrong.');
												console.log(data);
											}
											break;
									}
								});
							}
						)
						.catch(function(err) {
							console.error('LOGIN.fetch() NETWORK ERROR: '+err);
						});
					}
					else root.cmd.say('Invalid password.');
					return false;
				}
			},
			'logout': {
				desc: 'log out from the website',
				exec: function() {
					root.cmd.local.id.ph = '';
					root.storeLocal('id', JSON.stringify(root.cmd.local.id));
					root.cmd.local.prompt.val = root.cmd.local.prompt.default;
					root.storeLocal('prompt', JSON.stringify(root.cmd.local.prompt));
					if (typeof(root.cmd.local.prompt.onchange) != 'undefined')
						root.cmd.local.prompt.onchange();
					else
						root.cmd.setPrompt(root.cmd.local.prompt.val);
					root.cmd.say('Logout ok.');
					return false;
				}
			},
			'new': {
				title: 'NEW title',
				required: 'Please enter title.',
				desc: 'create a new web page and set its title to <em>title</em>',
				examples: ['new CO_2 bubble', 'new ^{10}C is a nice isotope'],
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					val = val.replace(/\\/g, '').express();
					if (val.length < 1) {
						root.cmd.say('Please provide the title.');
						return false;
					}
					root.webpages.create_local(val);
					if (typeof($('body > div.spirit.main_head').html()) == 'undefined') {
						root.spirits.createHeading(val);
						root.webpages.save_local();
					}
					return false;
				}
			},
			'pay': {
				title: 'PAY [amount]',
				desc: 'pay tribute to the creator of this universum<br>if <em>amount</em> is specified it is a direct link to payment page (your browser might ask for additional confirmation on opening the popup window)<br><em>amount</em> of 1 is equal to 0.0001 %PAY_METHOD%',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if ($.isNumeric(val)) {
						val *= 0.0001;
						window.open(universes[0].payment.direct_link.replace('%VAL%', val), '_blank');
						return false;
					}
					var out = '<b>'+universes[0].payment.title+'</b>: '+universes[0].payment.address;
					out += '<br><br><span class="indent"></span><em>This is one of the ways to give back.</em>';
					root.cmd.cmds.div.exec('<br>'+out);
					return true;
				}
			},
			'play': {
				title: 'PLAY [content]',
				desc: 'play video/audio <em>content</em><br>if <em>content</em> is not specified plays files from <b>playlist</b> system variable<br>you might need to adjust your browser settings for autoplay to work<br>playing local files might also be problematic, in that case you might want to consider running a local web server (ie. nginx) to serve media files',
				examples: ['play file:///E:/MUSIC/ACDC - Who Made Who.mp3', 'play < .media_playlist2 >1.fix', 'play << .media_playlist2'],
				exec: function(content = false) {
					var use_playlist = false;
					if (content === false) content = root.cmd.args_all;
					if (content.length > 0) {
						if (!content.match(/[\/\\]+/i)) content = root.cmd.local.play_dir.val + content;
						if (!content.match(/\.[^\.]{1,4}$/)) content = content + '.mp3';
						root.cmd.playlist.entities.push({ title: content.replace(/^.*\/([^\/]+)$/, '$1'), file: content });
						root.cmd.playlist.total++;
						root.cmd.playlist.idx = root.cmd.playlist.total - 1;
					}
					else {
						if (root.cmd.playlist.total < 1 || root.cmd.input_redirect.length > 0 || root.cmd.input_redirect_append.length > 0) {
							var playlist_txt = '';
							var playlist = root.cmd.local.playlist.val;
							if (root.cmd.input_redirect_append.length > 0) {
								playlist = root.cmd.input_redirect_append;
							}
							else if (root.cmd.input_redirect.length > 0) {
								playlist = root.cmd.input_redirect;
								root.cmd.playlist.entities = [];
								root.cmd.playlist.idx = 0;
								root.cmd.playlist.total = 0;
							}
							if (playlist.match(/[\/]+/)) {
								console.log('FETCHING PLAYLIST');
								fetch(playlist)
								  .then(response => response.text())
								  .then((data) => {
									playlist_txt = data;
								  });
							}
							//else playlist_txt = $(playlist).text();
							else playlist_txt = $(playlist).html().stripTags(2);
							var tmp = playlist_txt.split(/\n/);
							var	match, title = '', tmpthis;
							$(tmp).each(function (idx) {
								if (this.match(/^#EXTM/i) || this.trim().length < 1) return;
								myRegexp = /^#EXTINF:[^\,]*\,(.*)/i;
								match = myRegexp.exec(this);
								if (match !== null && typeof(match[1]) != 'undefined') title = match[1];
								else {
									tmpthis = this.replace(/\\/g, '/');
									if (!tmpthis.match(/\:\/\//)) tmpthis = 'file:///'+tmpthis;
									if (title.length < 1) title = tmpthis.replace(/^.*\/([^\/]+)$/, '$1');
									root.cmd.playlist.entities.push({ title: title, file: tmpthis });
									root.cmd.playlist.total++;
									title = '';
								}
							});
						}
						content = '';
						if (root.cmd.playlist.total > 0) {
							use_playlist = true;
							if (root.cmd.local.playlist.shuffle)
								root.cmd.playlist.idx = Math.round(Math.random() * (root.cmd.playlist.total - 1));
							//console.log(root.cmd.playlist);
							content = root.cmd.playlist.entities[root.cmd.playlist.idx].file;
						}
					}
					if (content.length > 0) {
						root.cmd.local.playlist.type = root.cmd.playlist.getMediaType(content);
						var el_host = $('<div class="video_player"></div>');
						// autoplay seems to produce 2 concurrent streams on firefox, so we call play() manually
						//var el = $('<'+root.cmd.local.playlist.type+' controls autoplay><source src="'+root.cmd.encode(content)+'"></'+root.cmd.local.playlist.type+'>');
						var el = $('<'+root.cmd.local.playlist.type+' controls><source src="'+root.cmd.encode(content)+'"></'+root.cmd.local.playlist.type+'>');
						var el_next = $('<div class="video_next">&Gt;</div>');
						var el_title = $('<div class="title" title="'+root.cmd.encode(root.cmd.playlist.entities[root.cmd.playlist.idx].file)+'">'+root.cmd.encode(root.cmd.playlist.entities[root.cmd.playlist.idx].title)+'</div>');
						el_host.append(el_title).append(el).append(el_next);
						if (root.cmd.output_redirect_append.length > 0)
							root.views.append(el_host, root.cmd.output_redirect_append);
						else if (root.cmd.output_redirect.length > 0)
							root.views.update(el_host, root.cmd.output_redirect);
						else
							root.views.append(el_host);
						el_next.hide();
						el.trigger('play');
						setTimeout(function() { el_next.show(); }, 2000);
						if (use_playlist) {
							el.on('ended', function() {
								if (root.cmd.local.playlist.shuffle)
									root.cmd.playlist.idx = Math.round(Math.random() * (root.cmd.playlist.total - 1));
								else
									root.cmd.playlist.idx += 1;
								if (root.cmd.playlist.idx < root.cmd.playlist.total) {
									el_title.html(root.cmd.encode(root.cmd.playlist.entities[root.cmd.playlist.idx].title));
									el_title.attr('title', root.cmd.playlist.entities[root.cmd.playlist.idx].file);
									var oldtype = root.cmd.local.playlist.type;
									root.cmd.local.playlist.type = root.cmd.playlist.getMediaType(root.cmd.playlist.entities[root.cmd.playlist.idx].file);
									if (oldtype != root.cmd.local.playlist.type) {
										//$(this).replaceWith($('<'+root.cmd.local.playlist.type+' controls autoplay><source src="'+root.cmd.playlist.entities[root.cmd.playlist.idx].file+'"></'+root.cmd.local.playlist.type+'>'));
										$(this).replaceWith($('<'+root.cmd.local.playlist.type+' controls><source src="'+root.cmd.playlist.entities[root.cmd.playlist.idx].file+'"></'+root.cmd.local.playlist.type+'>'));
									}
									this.src = root.cmd.playlist.entities[root.cmd.playlist.idx].file;
									this.play();
								}
							});
						}
						el_next.on('click', function(e) {
							$(this).prev()[0].pause();
							$(this).prev().trigger('ended');
						});
					}
				}
			},
			'plugins': {
				title: 'PLUGINS [key [enable|disable|load]]',
				desc: 'Shows status of all plugins or the one specified with a <em>key</em>. If specified, <em>enable</em> or <em>disable</em> will enable, or disable, respectively, autoloading of the plugin on boot.',
				exec: function(key, update) {
					if (typeof key == 'undefined') {
						//content = root.cmd.args_all;
						if (root.cmd.args[1]) key = root.cmd.args[1];
						if (root.cmd.args[2]) update = root.cmd.args[2];
					}
					let out;
					if (typeof key == 'undefined') {
						out = 'Available plugins:<br><br>';
						for (let idx in root.plugins.plugins)
							out += '<b>'+root.plugins.plugins[idx].key+'</b>: <div class="desc">'+JSON.stringify(root.plugins.plugins[idx], undefined, 4).HTMLize()+'</div>';
					}
					else {
						let idx = root.plugins.get_plugin_idx_by_key(key);
						if (idx === false) {
							root.cmd.say('No such plugin.');
							return false;
						}
						if (typeof update != 'undefined') {
							switch (update.toLowerCase()) {
								case 'enable':
									root.plugins.enable(idx);
									root.cmd.say('Plugin autoload enabled.');
									break;
								case 'disable':
									if (root.plugins.canDisable(idx)) {
										root.plugins.disable(idx);
										root.cmd.say('Plugin autoload disabled.');
									}
									else
										root.cmd.say('Sorry, autoload of this plugin cannot be disabled.');
									break;
								case 'load':
									if (root.plugins.isLoaded(idx)) {
										root.cmd.say('Plugin already loaded.');
										break;
									}
									root.plugins.load(idx);
									break;
								case 'reload':
									root.plugins.load(idx, true);
									break;
								default:
									root.cmd.say('I do not understand '+update);
							}
							return false;
						}
						out = '<b>'+key+'</b>: <div class="desc">'+JSON.stringify(root.plugins.plugins[idx], undefined, 4).HTMLize()+'</div>';
					}
					out = out.niceJSON().replace(/("[^"]+":\s+)"(.*?)",/g, '$1$2,').replace(/"title":\s+(.*?)(,[\r\n]*\<br\>)/g, '"title": <b>$1</b>$2').replace(/,([\r\n]*\<br\>)/g, '$1');
					root.cmd.cmds.div.exec('<br>'+out+'<br>');
					return true;
				}
			},
			'pre': {
				title: 'PRE<em>[.classname]</em> content',
				desc: 'HTML &lt;PRE class="<em>classname</em>"&gt;<em>content</em>&lt;/PRE&gt; tag',
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					var el = $('<pre'+(root.cmd.local.classname.val!=''?' class="'+root.cmd.local.classname.val+'"':'')+'>'+content+'</pre>');
					root.views.append(el);
				}
			},
			'queue': {
				title: 'QUEUE [command] [/C]',
				desc: 'add <em>command</em> to queue<br>with no command argument, lists queued commands<br>/C - clears queue<br><br>queued commands are run in FIFO order upon boot, idlemaster init or manually by RUN command',
				examples: ['queue dir', 'queue << div.shellcmds'],
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					if (root.cmd.input_redirect_append.length > 0) {
						var tmp, lines = $(root.cmd.input_redirect_append).html().split("\n");
						$(lines).each(function(idx) {
							tmp = this.trim();
							if (tmp.length > 0) root.cmd.queue(this.trim());
						});
					}
					else if (root.cmd.input_redirect.length > 0) {
						var tmp, lines = $(root.cmd.input_redirect).html().split("\n");
						if (lines.length > 0) {
							root.cmd.local.queue_cmds = [];
							$(lines).each(function(idx) {
								tmp = this.trim();
								if (tmp.length > 0) root.cmd.queue(this.trim());
							});
						}
					}
					else if (content.length < 1) {
						var tmp;
						if (root.cmd.local.queue_cmds.length < 1) {
							root.cmd.say('No queued commands.');
							return false;
						}
						var out = 'Queued commands:<br><br>';
						for (var key in root.cmd.local.queue_cmds) {
							tmp = root.cmd.local.queue_cmds[key].cmd;
							out += '<b>'+key+'</b>: '+tmp+'<br>';
						}								
						root.cmd.cmds.div.exec('<br>'+out+'<br>');
					}
					else if (content.match(/\/C$/i)) {
						root.cmd.local.queue_cmds = [];
						return false;
					}
					if (content.length > 0) {
						root.cmd.queue(content);
						return false;
					}
					return true;
				}
			},
			'reboot': {
				desc: 'reboots the system, skipping greetings',
				exec: function() {
					root.storeLocal('reboot', 'true', 'root');
					location.reload();
					return false;
				}
			},
			'reg': {
				title: 'REG password',
				required: 'Please enter the password.',
				desc: 'register your id on this website using <em>password</em><br>password may contain letters, numbers and underscore (_) chars, min. 3 and maximum 16 chars',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if (val.match(/^[A-Za-z0-9\_]{3,16}$/)) {
						fetch('/users/users.php?cmd=reg&id='+root.cmd.local.id.val+'&p='+val)
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('REG.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									switch (data) {
										case '0':
											root.cmd.say('Registrations are disabled.');
											break;
										case '-1':
											root.cmd.say('Invalid id or password.');
											break;
										case '1':
											root.cmd.say('That id is already registered. You can change your id with "id" command.');
											break;
										default: 
											if (data.length == 64) {
												root.cmd.local.id.ph = data;
												root.storeLocal('id', JSON.stringify(root.cmd.local.id));
												root.cmd.say('Registration ok.');
											}
											else {
												root.cmd.say('Cannot register right now. Try later.');
												console.log(data);
											}
											break;
									}
								});
							}
						)
						.catch(function(err) {
							console.error('REG.fetch() NETWORK ERROR: '+err);
						});
					}
					else root.cmd.say('Invalid password.');
					return false;
				}
			},
			'ren': {
				title: 'REN old_title new_title',
				required: 'Please enter old and new title.',
				desc: 'renames a local web page',
				examples: ['ren "Something old" "Something new"'],
				exec: function(old_title=false, new_title=false) {
					var arg2 = 2;
					if (root.cmd.args[1]) {
						old_title = root.cmd.args[1];
						if (old_title.match(/^"/)) {
							old_title = old_title.replace(/^"/, '');
							while (!old_title.match(/"$/) && typeof(root.cmd.args[arg2]) != 'undefined') {
								old_title += ' '+root.cmd.args[arg2++]
							}
							old_title = old_title.replace(/"$/, '');
						}
					}
					if (root.cmd.args[arg2]) {
						new_title = root.cmd.args[arg2];
						if (new_title.match(/^"/)) {
							new_title = new_title.replace(/^"/, '');
							while (!new_title.match(/"$/) && typeof(root.cmd.args[++arg2]) != 'undefined') {
								new_title += ' '+root.cmd.args[arg2]
							}
							new_title = new_title.replace(/"$/, '');
						}
					}
					if (old_title === false)
						root.cmd.say('Please provide old title.');
					else if (new_title === false)
						root.cmd.say('Please provide new title.');
					else if (!root.webpages.rename_local(old_title.replace(/\\/g, '').express(), new_title.replace(/\\/g, '').express()))
						root.cmd.say('Web page not found.');
					return false;
				}
			},
			'reset': {
				title: 'RESET <em>variable</em>',
				desc: "reset system <em>variable</em> to default value<br>if <em>variable</em> is not specified resets all",
				exec: function() {
					if (root.cmd.args[1]) {
						if (root.cmd.args[1].indexOf('.') > 0) {
							var tmp = root.cmd.args[1].split('.');
							switch (tmp.length) {
								case 3:
									root.cmd.local[tmp[0]][tmp[1]][tmp[2]].val = root.cmd.local[tmp[0]][tmp[1]][tmp[2]].default;
									if (typeof(root.cmd.local[tmp[0]][tmp[1]][tmp[2]].onchange) != 'undefined') root.cmd.local[tmp[0]][tmp[1]][tmp[2]].onchange();
									break;
								default:
									root.cmd.local[tmp[0]][tmp[1]].val = root.cmd.local[tmp[0]][tmp[1]].default;
									if (typeof(root.cmd.local[tmp[0]][tmp[1]].onchange) != 'undefined') root.cmd.local[tmp[0]][tmp[1]].onchange();
							}
							//root.removeLocal(tmp[0]);
						}
						else {
							if (root.cmd.local[root.cmd.args[1]])
								root.cmd.local[root.cmd.args[1]].val = root.cmd.local[root.cmd.args[1]].default;
							if (typeof(root.cmd.local[root.cmd.args[1]].onchange) != 'undefined') root.cmd.local[root.cmd.args[1]].onchange();
							root.removeLocal(root.cmd.args[1]);
						}
					}
					else {
						root.cmd.setDefaults();
						for (var key in root.cmd.local) {
							//root.cmd.local[key].val = root.cmd.local[key].default;
							root.removeLocal(key);
						}
					}
					return false;
				}
			},
			'restart': {
				desc: 'restart the system',
				exec: function() {
					location.reload(true);
					return false;
				}
			},
			'restore': {
				title: 'RESTORE variable',
				required: 'Which variable should I restore the value for?',
				desc: 'restores previous value of the <em>variable</em>',
				exec: function() {
					if (root.cmd.args[1]) {
						var tmp, val;
						if (root.cmd.args[1].indexOf('.') > 0) {
							tmp = root.cmd.args[1].split('.');
							switch (tmp.length) {
								case 3:
									if (tmp[2] == 'val' && typeof(root.cmd.local[tmp[0]][tmp[1]][tmp[2]]) != 'undefined')
										root.cmd.restoreOld(root.cmd.local[tmp[0]][tmp[1]]);
									else {
										//root.cmd.restoreOld(root.cmd.local[tmp[0]][tmp[1]][tmp[2]]);	// SET not impemented for this
										root.cmd.restoreOld(root.cmd.local[tmp[0]][tmp[1]]);
									}
									if (typeof(root.cmd.local[tmp[0]][tmp[1]].onchange) != 'undefined')
										root.cmd.local[tmp[0]][tmp[1]].onchange();
									break;
								default:
									if (tmp[1] == 'val' && typeof(root.cmd.local[tmp[0]][tmp[1]]) != 'undefined') {
										root.cmd.restoreOld(root.cmd.local[tmp[0]]);
										if (typeof(root.cmd.local[tmp[0]].onchange) != 'undefined')
											root.cmd.local[tmp[0]].onchange();												
									}
									else {
										root.cmd.restoreOld(root.cmd.local[tmp[0]][tmp[1]]);
										if (typeof(root.cmd.local[tmp[0]][tmp[1]].onchange) != 'undefined')
											root.cmd.local[tmp[0]][tmp[1]].onchange();
									}
							}
							val = root.cmd.local[tmp[0]];
							if (typeof(root.cmd.locked[tmp[0]]) != 'undefined') {
								val = JSON.parse(JSON.stringify(val));
								val.desc = undefined;
							}
							root.storeLocal(tmp[0], JSON.stringify(val));
						}
						else {
							root.cmd.restoreOld(root.cmd.args[1]);
							val = root.cmd.local[root.cmd.args[1]];
							if (typeof(root.cmd.locked[root.cmd.args[1]]) != 'undefined') {
								tmp = JSON.parse(JSON.stringify(val));
								tmp.desc = undefined;
								val = tmp;
							}
							root.storeLocal(root.cmd.args[1], JSON.stringify(val));
							if (typeof(root.cmd.local[root.cmd.args[1]].onchange) != 'undefined')
								root.cmd.local[root.cmd.args[1]].onchange();
						}
					}
					return false;
				}
			},
			'run': {
				title: 'RUN [command]',
				desc: 'runs <em>command</em>, or commands in queue if <em>command</em> not specified unless current chapter has a link in the title (ie. RUN link to a game), in which case that link will be followed',
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					if (content == '') {
						let el = $(root.cmd.getSubDirLevel()+'[hash="'+root.cmd.active_dir+'"]');
						if (typeof(el.html()) != 'undefined') {
							el = $('>a', el);
							if (typeof(el.html()) != 'undefined') {
								//el.trigger('click');
								window.location.href = el.attr('href');
								return false;
							}
						}
					}
					root.cmd.input(content);
					return false;
				}
			},
			'say': {
				title: 'SAY something',
				desc: 'instructs MATERRA to say <em>something</em>',
				examples: ['say Hello bastard', 'say < .epitaph'],
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					var tmp;
					if (content.length > 0) {
						var limit = root.cmd.el_system.getCharWidth();
						tmp = content.break(limit);
						$(tmp).each(function (idx) {
							root.cmd.say(this+"\n");
						});
					}
					if (root.cmd.input_redirect.length > 0) {
						var lines = $(root.cmd.input_redirect).html().replace(/^\<h[0-9]+[^\>]*\>.*?\<\/h[0-9]+\>/, '').replace(/\<a class="reflink"[^\>]*\>.*?\<\/a\>/g, '').replace(/\<sup\>(.*?)\<\/sup\>/g, '^$1').stripTags().split("\n");
						if (lines.length > 0) {
							$(lines).each(function(idx) {
								tmp = this.trim();
								if (tmp.length > 0) root.cmd.cmds.say.exec(tmp);
							});
						}
					}
				}
			},
			'set': {
				title: 'SET [variable [value]]',
				desc: "if <em>value</em> is specified sets system <em>variable</em>,<br>otherwise shows <em>variable</em> content<br>if <em>variable</em> not specified lists all variables",
				exec: function() {
					if (root.cmd.args[2]) {
						var tmp, val = root.cmd.args_all.replace(/^[^\s]+\s+(.*)$/, '$1');
						if (val.match(/^true$/i))
							val = true;
						else if (val.match(/^false$/i))
							val = false;
						else if (val.match(/^[0-9\.]+$/i))
							val = Number(val);
						else {
							if (val.match(/\$\{[^\}]+\}/)) {
								try {
									val = root.cmd.parse(val);
								}
								catch (error) { root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false; }
							}
							else {
								//console.log('VAL=#'+val+'#');
								//val = JSON.parse(val);
								try {
									val = Function('"use strict";return (' + val + ')')();
								}
								catch (error) { root.cmd.say('Sorry '+root.cmd.local.id.val+', '+error.message+'.'); return false; }
							}
						}
						if (root.cmd.args[1].indexOf('.') > 0) {
							tmp = root.cmd.args[1].split('.');
							switch (tmp.length) {
								case 3:
									if (tmp[2] == 'val' && typeof(root.cmd.local[tmp[0]][tmp[1]][tmp[2]]) != 'undefined')
										root.cmd.setOld(root.cmd.local[tmp[0]][tmp[1]]);
									root.cmd.local[tmp[0]][tmp[1]][tmp[2]] = val;
									if (typeof(root.cmd.local[tmp[0]][tmp[1]].onchange) != 'undefined')
										root.cmd.local[tmp[0]][tmp[1]].onchange();
									break;
								default:
									if (tmp[1] == 'val' && typeof(root.cmd.local[tmp[0]][tmp[1]]) != 'undefined')
										root.cmd.setOld(root.cmd.local[tmp[0]]);
									root.cmd.local[tmp[0]][tmp[1]] = val;
									if (typeof(root.cmd.local[tmp[0]].onchange) != 'undefined')
										root.cmd.local[tmp[0]].onchange();
							}
							val = root.cmd.local[tmp[0]];
							if (typeof(root.cmd.locked[tmp[0]]) != 'undefined') {
								val = JSON.parse(JSON.stringify(val));
								val.desc = undefined;
							}
							root.storeLocal(tmp[0], JSON.stringify(val));
						}
						else {
							if ((root.cmd.args[1] == 'queue_cmds' || root.cmd.args[1] == 'autorun') && !Array.isArray(val))
								val = [ val ];
							else if (typeof(val) !== 'object') val = { val: val };
							if (typeof(root.cmd.local[root.cmd.args[1]]) != 'undefined') {
								root.cmd.setOld(root.cmd.args[1]);
								if (typeof(root.cmd.local[root.cmd.args[1]].onchange) != 'undefined')
									val.onchange = root.cmd.local[root.cmd.args[1]].onchange;
								if (typeof(root.cmd.local[root.cmd.args[1]].desc) != 'undefined')
									val.desc = root.cmd.local[root.cmd.args[1]].desc;
								if (typeof(root.cmd.local[root.cmd.args[1]].old) != 'undefined')
									val.old = root.cmd.local[root.cmd.args[1]].old;
								if (typeof(root.cmd.local[root.cmd.args[1]].default) != 'undefined' && typeof(val.default) == 'undefined')
									val.default = root.cmd.local[root.cmd.args[1]].default;
								if (typeof(root.cmd.local[root.cmd.args[1]].val) != 'undefined' && typeof(val.val) == 'undefined')
									val.val = root.cmd.local[root.cmd.args[1]].val;
								if (root.cmd.args[1] == 'man') {
									if (typeof(val.enabled) == 'undefined')
										val.enabled = root.cmd.local[root.cmd.args[1]].enabled;
									if (typeof(val.delay) == 'undefined')
										val.delay = root.cmd.local[root.cmd.args[1]].delay;
									if (typeof(val.enabled.default) == 'undefined')
										val.enabled.default = root.cmd.local[root.cmd.args[1]].enabled.default;
									if (typeof(val.enabled.val) == 'undefined')
										val.enabled.val = root.cmd.local[root.cmd.args[1]].enabled.val;
									val.enabled.old = root.cmd.local[root.cmd.args[1]].enabled.old;
									if (typeof(val.delay.default) == 'undefined')
										val.delay.default = root.cmd.local[root.cmd.args[1]].delay.default;
									if (typeof(val.delay.val) == 'undefined')
										val.delay.val = root.cmd.local[root.cmd.args[1]].delay.val;
									val.delay.old = root.cmd.local[root.cmd.args[1]].delay.old;
								}
								else if (root.cmd.args[1] == 'playlist') {
									if (typeof(val.type) == 'undefined')
										val.type = root.cmd.local[root.cmd.args[1]].type;
									if (typeof(val.shuffle) == 'undefined')
										val.shuffle = root.cmd.local[root.cmd.args[1]].shuffle;
								}
							}
							root.cmd.local[root.cmd.args[1]] = val;
							if (root.cmd.args[1] != 'local' && typeof(root.cmd.local[root.cmd.args[1]]) == 'undefined') {
								//root.cmd.local.push(root.cmd.args[1]);
								root.storeLocal('local', JSON.stringify(root.cmd.local));
							}
							if (typeof(root.cmd.locked[root.cmd.args[1]]) != 'undefined') {
								tmp = JSON.parse(JSON.stringify(val));
								tmp.desc = undefined;
								val = tmp;
							}
							root.storeLocal(root.cmd.args[1], JSON.stringify(val));
							if (typeof(root.cmd.local[root.cmd.args[1]].onchange) != 'undefined')
								root.cmd.local[root.cmd.args[1]].onchange();
						}
					}
					else if (root.cmd.args[1]) {
						var tmp = root.cmd.local[root.cmd.args[1]];
						tmp = JSON.parse(JSON.stringify(tmp));
						tmp.desc = undefined;
						tmp = JSON.stringify(tmp);
						if (typeof(root.cmd.local[root.cmd.args[1]].desc) != 'undefined')
							tmp += '<br><br>'+root.cmd.local[root.cmd.args[1]].desc;
						else if (typeof(root.cmd.local_desc[root.cmd.args[1]]) != 'undefined')
							tmp += '<br><br>'+root.cmd.local_desc[root.cmd.args[1]];
						var out = '<b>'+root.cmd.args[1]+'</b>: <div class="desc">'+tmp.niceJSON()+"</div>";
						root.cmd.cmds.div.exec('<br>'+out+'<br>');
						return true;
					}
					else {
						var space = 'root.cmd.local', tmp;
						var out = 'System variables ('+space+'):<br><br>';
						for (var key in root.cmd.local) {
							tmp = root.cmd.local[key];
							if (typeof(tmp.desc) != 'undefined') {
								tmp = JSON.parse(JSON.stringify(tmp));
								tmp.desc = undefined;
								tmp = JSON.stringify(tmp)+'<br><br>'+root.cmd.local[key].desc+'<br><br>';
							}
							else if (typeof(root.cmd.local_desc[key]) != 'undefined') {
								tmp = JSON.parse(JSON.stringify(tmp));
								tmp.desc = undefined;
								tmp = JSON.stringify(tmp)+'<br><br>'+root.cmd.local_desc[key]+'<br><br>';
							}
							else tmp = JSON.stringify(tmp);
							out += '<b>'+key+'</b>: <div class="desc">'+tmp.niceJSON()+"</div>";
						}
						out += '<br>Examples:<div class="desc">set prompt "C:\\\\"<br>set prompt.val \${'+space+'.id.val}<br>set prompt {val:"LV-426",default:"Acheron"}</div>';
						root.cmd.cmds.div.exec('<br>'+out+'<br>');
						return true;
					}
					return false;
				}
			},
			'talk': {
				title: 'TALK',
				desc: 'instructs MATERRA to say something random, perhaps starting a conversation?',
				vars: {
					last_talk_x: -1,
					last_quote: '',
					user_input_history: [],
					user_input_history_max_length: 1000
				},
				exec: function(content = false, target = false, target_only_body = false) {
					if (content === false) content = root.cmd.current;	// ! root.cmd.args_all
					//root.cmd.say(content);return false;
					if (content == 'talk' && Math.random() > 0.75) content = '';
					if (this.vars.user_input_history.length > this.vars.user_input_history_max_length) this.vars.user_input_history = [];
					var url = '/talk/talk.php?x='+this.vars.last_talk_x+'&input='+encodeURIComponent(content)+'&last_quote='+encodeURIComponent(this.vars.last_quote)+(($.inArray(this.vars.last_quote+content, this.vars.user_input_history) > -1)?'&d=1':'')+(target!==false?'&target=1':'');
					if ($.inArray(this.vars.last_quote+content, this.vars.user_input_history) < 0) this.vars.user_input_history.push(this.vars.last_quote+content);
					this.vars.last_quote = '';
					fetch(url)
					.then(
						function(response) {					
							if (response.status != 200) {
								console.warn('talk.fetch('+url+') ERROR: '+response.status);
								if (response.status == 404)
									root.cmd.say('File "'+url+'" not found.'+"\n");
								else {
									if (target !== false) $(target)[0].outerHTML = 'TALK() ERROR: '+response.status+"\n";
									else root.cmd.say('TALK() ERROR: '+response.status+"\n");
								}
								return;
							}
							console.log('FETCH OK!');
							response.text().then(function (data) {
								if (data.indexOf(':') >= 0) {
									let tmp = data.split(':');
									let tmp_cnt = tmp.length;
									if ($.isNumeric(tmp[0]))
										root.cmd.cmds.talk.vars.last_talk_x = tmp[0];
									let content = '';
									for (let i=1; i<tmp_cnt; i++) {
										content += (i>1?':':'')+tmp[i];
									}
									if (content.length > 0) {
										if (tmp[0] == 'Q') {
											tmp = content.split('||');
											if (target !== false) {
												//let str = tmp[1].HTMLize('<br>', true);
												let str = tmp[1], target_parent = $(target).parent();
												if (target_only_body) $(target)[0].outerHTML = str;
												else $(target)[0].outerHTML = '<b>'+tmp[0]+'</b><br>'+(str.indexOf('<ul>')==0?'':'<br>')+str;
												target_parent.formatSpirit();												
												root.clearPast($('div[timerel]', target_parent));
												target_parent.html(target_parent.html().replace(/\$([^\$]+?)\$/g, '<script type="math/tex" id="">$1<\/script>'));
												if (1) {
													var buildref = false;
													$('a', target_parent).each(function (idx) {
														if (!$(this).hasAttribute('noref')) {
															buildref = true;
															return false;	// break
														}
													});
													let buildsummary = false;
													if (buildref) {
														root.unbuildReferences();
														root.buildReferences();
														buildsummary = true;
													}
													if (typeof($('update', target_parent).html()) != 'undefined') {
														root.buildChangeLog();
														buildsummary = true;
													}
													if (buildsummary) {
														root.summary.build();
														root.summary.buildHTML(root.cmd.local.view.val, true);
													}														
												}
												MathJax.Hub.Queue(["Reprocess", MathJax.Hub, target_parent[0]]);
											}
											else {
												let old = root.cmd.local.classname.val;
												root.cmd.local.classname.val = 'answer';
												let str = tmp[1].HTMLize('<br>', true);
												root.cmd.cmds.div.exec('<b>'+tmp[0]+'</b><br>'+(str.indexOf('<ul>')==0?'':'<br>')+str);
												root.cmd.local.classname.val = old;
												root.cmd.cmds.hr.exec();
											}
										}
										else {
											let limit = root.cmd.el_system.getCharWidth();
											root.cmd.cmds.talk.vars.last_quote = content;
											tmp = content.break(limit);
											tmp_cnt = tmp.length;
											$(tmp).each(function (idx) {
												//root.cmd.say(this+(tmp_cnt>1?"\n":''));
												root.cmd.say(this+"\n");
											});
										}
									}
								}
								else if (data == '-1') {	// TALK disabled
									root.cmd.say("I don't feel like talking today.");
									root.cmd.cmds.talk.vars.last_quote = "I don't feel like talking today.";
								}
								else {
									let tmp = Math.random();
									if (tmp > 0.75)
										root.cmd.say("Looking for a command? Type '?' or 'help' for a list of available commands.");
									else if (tmp > 0.5) {
										tmp = Math.random();
										if (tmp > 0.5) root.cmd.say("I don't have the answer to that right now.");
										else {
											root.cmd.say("I don't know.");
											root.cmd.cmds.talk.vars.last_quote = "I don't know.";
										}
									}
									else {
										tmp = Math.random();
										if (tmp > 0.5) {
											root.cmd.say('No comment.');
											root.cmd.cmds.talk.vars.last_quote = 'No comment.';
										}
										else {
											root.cmd.say("I'm speechless.");
											root.cmd.cmds.talk.vars.last_quote = "I'm speechless.";
										}
									}
								}
							});
						}
					)
					.catch(function(err) {
						console.error('talk.fetch() NETWORK ERROR (url='+url+'): '+err);
						if (target !== false) $(target)[0].outerHTML = 'TALK() NETWORK ERROR: '+err+"\n";
						else root.cmd.say('TALK() NETWORK ERROR: '+err+"\n");
					});
					return false;
				}
			},
			'textblocks': {
				title: 'TEXTBLOCKS [expand|collapse]',
				desc: '<em>expand</em>, <em>collapse</em>, or <em>toggle</em> (if param omitted) the state of, the text blocks on the webpage',
				exec: function(content = false) {
					if (content === false) content = root.cmd.args_all;
					content = content.toLowerCase();
					switch (content) {
						case 'expand':
							$('body div.expander_main[state="0"]').trigger('click');
							break;
						case 'collapse':
							$('body div.expander_main[state="1"]').trigger('click');
							break;
						default:
							$('body div.expander_main').trigger('click');
					}
					return false;
				}
			},
			'unhide': {
				desc: 'make the command line interface (CLI) permanently visible',
				exec: function() {
					$('#cmd').removeClass('hover');
					return false;
				}
			},
			'unreg': {
				title: 'UNREG',
				desc: 'Close your account on the website.',
				exec: function() {
					if (root.cmd.local.id.val.match(/^[A-Za-z0-9\_]{3,16}$/) && root.cmd.local.id.ph.match(/^[A-Za-z0-9]{64}$/)) {
						fetch('/users/users.php?cmd=unreg&id='+root.cmd.local.id.val+'&ph='+root.cmd.local.id.ph)
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('UNREG.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									switch (data) {
										case '-1':
											root.cmd.say('Invalid id or password.');
											break;
										case '-2':
											root.cmd.say('The id "'+root.cmd.local.id.val+'" is not registered.');
											break;
										case '1':
											root.cmd.local.id.ph = '';
											root.storeLocal('id', JSON.stringify(root.cmd.local.id));
											root.cmd.say('Account closed.');
											break;
										case '0':
											root.cmd.say('DB error.');
											break;
										default: 
											root.cmd.say('Something went wrong.');
											break;
									}
								});
							}
						)
						.catch(function(err) {
							console.error('UNREG.fetch() NETWORK ERROR: '+err);
						});
					}
					else root.cmd.say('Invalid id data. Please login first.');
					return false;
				}
			},
			'upload': {
				title: 'UPLOAD [key]',
				desc: 'uploads the loaded local webpage to server<br><em>key</em> is optional if specified in a system variable <em>upload_key</em>',
				exec: function(val = false) {
					if (val === false) val = root.cmd.args_all;
					if (val.length < 1) {
						if (typeof(root.cmd.local.upload_key) != 'undefined' && typeof(root.cmd.local.upload_key.val) != 'undefined')
							val = root.cmd.local.upload_key.val;
						if (val.length < 1) {
							root.cmd.say('Please provide the auth key.');
							return false;
						}
					}
					root.webpages.upload(val);
					return false;
				}
			},
			'users': {
				desc: 'shows registered users on the website<br>requires admin account',
				exec: function() {
					root.load('/users/users.php?cmd=list&id='+root.cmd.local.id.val+'&ph='+root.cmd.local.id.ph);
					return false;
				}
			},
			'ver': {
				desc: 'shows the system info',
				exec: function() {
					root.cmd.say(root.id.stripTags()+' '+root.ver+"\n");
				}
			},
			'what is': {
				desc: 'alias of <b>define</b>, usually',
				exec: function() {	// NOTE: THIS IS NEVER CALLED! DEFINE CALLED DIRECTLY FROM root.cmd.set()
					//define(what = false, silent = false, only_first = false, only_defs = true, explain = false)
					return root.cmd.cmds.define.exec();
				}
			},
			'helpcmd': {
				exec: function(key) {
					if (!root.cmd.cmds[key]) {
						root.cmd.say('Command not found.');
						//return 'Command not found.<br>';
						return false;
					}
					var title = '<b>'+key.toUpperCase()+'</b>';
					if (root.cmd.cmds[key].title) title = '<b>'+root.cmd.cmds[key].title+'</b>';
					if (root.cmd.cmds[key].desc) {
						if (key == 'pay') root.cmd.cmds[key].desc = root.cmd.cmds[key].desc.replace('%PAY_METHOD%', universes[0].payment.title);
						title += "<div class=\"desc\">"+root.cmd.cmds[key].desc;
						if (root.cmd.cmds[key].examples) {
							title += '<br><br>Examples:<div class="desc">';
							$(root.cmd.cmds[key].examples).each(function(idx) {
								title += this+'<br>';
							});
							title += '</div>';
						}
						title += '</div>';
					}
					return title+'<br>';
				}
			},
			'help': {
				exec: function() {
					var out;
					if (root.cmd.args[1]) {
						out = root.cmd.cmds.helpcmd.exec(root.cmd.args[1].toLowerCase());
						if (out === false) return false;
					}
					else {
						out = "Supported commands:<br><br>";
						for (var key in root.cmd.cmds) {
							if (key == 'help' || key == 'helpcmd') continue;
							out += root.cmd.cmds.helpcmd.exec(key);
						}
					}
					root.cmd.cmds.div.exec('<br>'+out);
					return true;
				}
			}
		},
		run: function(idx=1) {
			console.log('"'+this.current+'"');
			if (this.cmd == '?') this.cmd = 'help';
			if (typeof (this.cmds[this.cmd]) == 'undefined') {
				//this.cmd = 'help';
				if (Math.random() > 0.95 && !this.current.isQuestion()) {
					this.say("Type '?' or 'help' for a list of available commands.");
					this.clear(idx);
					this.el.focus();
					setTimeout(function() { root.cmd.el_fallback.focus(); }, 2300);		// fix for Chrome
					return;
				}
				else this.cmd = 'talk';
			}
			var ret = this.cmds[this.cmd].exec();
			if (ret && this.local.separator.val)
				this.cmds.hr.exec();
			this.clear(idx);
			root.wins.alignBody();
			if (this.local.autobottom.val) {
				setTimeout(this.cmds.bottom.exec.bind(this.cmds.bottom), 33);
				setTimeout(this.cmds.bottom.exec.bind(this.cmds.bottom), 333);	// why ff?
				setTimeout(this.cmds.bottom.exec.bind(this.cmds.bottom), 750);	// why why
			}
			if (this.cmd != 'edit') {
				this.el.focus();
				setTimeout(function() {	root.cmd.el_fallback.focus(); }, 2300);		// fix for Chrome
			}
		},
		init: function() {
			for (var key in this.local)
				this.locked[key] = 1;
			this.setDefaults();
			if (typeof($('#cmd').html()) == 'undefined')
				$('<div id="cmd"></div>').insertAfter($('body'));
			else
				$('#cmd').insertAfter($('body'));
			$('#cmd').html('');
			// MATERRA
			var tmp = $('<div class="cmd" for="cmd0"></div>');
			tmp.append($('<label for="cmd0">'+this.local.prompt_system.val+'&nbsp;</label>'));
			this.el_system = $('<input id="cmd0" type="text" disabled></input>');
			tmp.append(this.el_system);
			$('#cmd').append(tmp);
			this.elements.push(this.el_system);
			// USER
			var tmp2 = $('<div class="cmd" for="cmd1"></div>');
			tmp2.append($('<label for="cmd1">'+this.local.prompt.val+'&nbsp;</label>'));
			this.el = $('<input id="cmd1" type="text"></input>');
			tmp2.append(this.el);
			$('#cmd').append(tmp2);
			this.el_fallback = $('#cmd #cmd1');
			this.elements.push(this.el);
			var $this = this;
			/*
			$('#cmd').on('click', function (e) {
				root.cmd.setOld(root.cmd.local.man.delay);
				root.cmd.local.man.delay.val = 0;
			});*/
			this.el_system.width(tmp.width() - ($('label', tmp).width()+18));
			this.el.width(tmp2.width() - ($('label', tmp2).width()+18));
			this.el_system.on('change', function(e) {
				clearTimeout(root.cmd.idlemaster.timeout);
				root.cmd.idlemaster.timeout = setTimeout(root.cmd.idlemaster.run.bind(root.cmd.idlemaster), root.cmd.local.idle_time.val);
			});
			this.el.on('keyup', function(e) {
				//console.log(e);
				clearTimeout(root.cmd.idlemaster.timeout);
				root.cmd.idlemaster.timeout = setTimeout(root.cmd.idlemaster.run.bind(root.cmd.idlemaster), root.cmd.local.idle_time.val);
				if (e.which == 13) {		// apparently .which is better than .keyCode
					if (root.cmd.question !== null) {
						root.cmd.question($this.el.val());
						root.cmd.question = null;
						if (root.cmd.question_timeout !== null) clearTimeout(root.cmd.question_timeout);
						root.cmd.question_timeout = null;
						$this.el.val('');
						return false;
					}
					let ret = $this.set($this.el.val());
					if (ret === false) {
						root.cmd.say(root.cmd.cmds[root.cmd.cmd].required);
						return false;
					}
					if ($this.last_total < 1 || $this.last[$this.last_total-1] != $this.el.val()) {
						$this.last.push($this.el.val());
						$this.last_total++;
						$this.last_idx = $this.last_total;
					}
					$this.run();
				}
				else if (e.which == 38) {	// UP
					if ($this.last_idx > 0)
						$this.el.val($this.last[--$this.last_idx]);
				}
				else if (e.which == 40) {	// DOWN
					if ($this.last_idx < ($this.last_total - 1))
						$this.el.val($this.last[++$this.last_idx]);
				}
				else if (e.which == 9)	{	// TAB
					e.preventDefault();
					return false;
				}
			});
			this.el.on('keydown', function(e) {
				if (e.which == 9)	{	// TAB
					e.preventDefault();
					$this.el.val($this.el.val()+"\t");
					return false;
				}
			});
			//this.el.focus();			Why? it's down below too..
			//setTimeout(function() { root.cmd.el_fallback.focus(); }, 3000);		// fix for Chrome
			if (1) {
				if (root.getLocal('local') !== null) {
					console.log('NOTNULL = local: '+root.getLocal('local'));
					this.setOld(this.local.man.enabled);
					this.local.man.enabled.val = false;
					var stored_queue_cmds = '[]';
					if (root.getLocal('queue_cmds') !== null)
						stored_queue_cmds = root.getLocal('queue_cmds');
					this.queue('set local '+root.getLocal('local'));
					this.input();
					this.restoreOld(this.local.man.enabled);
					root.storeLocal('queue_cmds', stored_queue_cmds);
				}
				for (var key in root.cmd.local) {
					if (root.getLocal(key) !== null && key != 'local' && key != 'queue_cmds') {
						console.log('NOTNULL = '+key+': '+root.getLocal(key));
						if (key == 'autorun') {
							this.set('set autorun '+' '+root.getLocal(key));
							root.cmd.cmds.set.exec();
						}
						else
							root.cmd.queue('set '+key+' '+root.getLocal(key));
					}
				}
			}
			if (root.getLocal('queue_cmds') !== null && root.getLocal('queue_cmds') != '[]') {
				console.log('NOTNULL = queue_cmds: '+root.getLocal('queue_cmds'));
				this.queue('set queue_cmds '+root.getLocal('queue_cmds'));
			}
			else {
			//if (this.local.queue_cmds.length < 1) {
				$(this.local.autorun).each(function(idx) {
					root.cmd.queue(this);
				});
				/*
				this.queue('set autobottom false');
				this.queue("dir");
				this.queue('restore autobottom');*/
			}
			this.setOld(this.local.man.enabled);
			this.local.man.enabled.val = false;
			this.input();
			this.restoreOld(this.local.man.enabled);
			if (root.getLocal('reboot', 'root') === 'true') {
				root.removeLocal('reboot', 'root');
				clearTimeout(this.idlemaster.timeout);
				this.idlemaster.timeout = setTimeout(this.idlemaster.run.bind(this.idlemaster), this.local.idle_time.val);
			}
			else {
				//function say(code = false, codefinal = false, nocheck = false, closequotes = true)
				//this.say();		// Hello ${root.cmd.local.id.val}
				this.say('Welcome to ${universes['+universes.current+'].id} universum.');
				this.say('Initializing omega engine..');
				clearTimeout(this.idlemaster.timeout);
				this.idlemaster.timeout = setTimeout(this.idlemaster.run.bind(this.idlemaster), this.local.idle_time.val);
				//this.say('&#9786;', true);
				this.say(false, true);	// Hello ${root.cmd.local.id.val}
			}
			this.el.focus();
			setTimeout(function() { root.cmd.el_fallback.focus(); }, 3000);		// fix for Chrome
		}
	},
	quotes : {
		quotes : [],
		interval : 66333,
		current : -1,
		total: 0,
		timeout: null,
		nextQuote : function() {
			if (typeof (this.quotes[(1+this.current) % this.total]) == 'undefined') this.current = -1;
			++this.current;
			if (typeof (this.quotes[this.current % this.total]) == 'undefined') return;
			let str = this.quotes[this.current % this.total].toString();
			$('.quotes').html(str).fadeOut('slow').fadeIn('slow');
			root.storeLocal('quote.current', this.current);
			//console.log(this.interval);
			$('.footer').height(10 + $('.quotes').height());
			$('.window').height($(window).height() - $('.quotes').outerHeight());
			var nextInterval = (this.interval * 2) % 133000;
			this.timeout = setTimeout(this.nextQuote.bind(this), nextInterval);
			this.interval = nextInterval;
		},
		load: function() {
			root.memory.load_quotes_from_storage();
			var $this = this;
			$(Object.keys(root.memory.quotes)).each(function (index) {
				$this.quotes = $this.quotes.concat(root.memory.quotes[this]);
			});
			this.total = this.quotes.length;
			if (typeof($('.quotes').html()) != 'undefined') {
				if (this.total < 1) {
					$('.quotes').each(function (idx) {
						let quotes = $(this).html().trim().split("\n");
						$this.quotes = $this.quotes.concat(quotes);
						if ($(this).hasClass('global')) root.memory.save_quotes(quotes);
					});
				}
				else {
					$('.quotes').each(function (idx) {
						let quotes = $(this).html().trim().split("\n");
						if ($(this).hasClass('global')) root.memory.save_quotes(quotes);
						$(quotes).each(function (index) {
							let str = this.toString();
							if ($.inArray(str, $this.quotes) > -1) return;	// continue
							$this.quotes.push(str);
						});
					});
				}
			}
			/*if (typeof($('.song').html()) != 'undefined')
				this.quotes = this.quotes.concat($('.song').html().trim().split("\n"));*/
			if (typeof($('.state').html()) != 'undefined')
				this.quotes = this.quotes.concat($('.state').html().trim().split("\n"));
			console.log(this.quotes);
			this.total = this.quotes.length;
			$('.quotes').remove();
		},
		close: function(nofocus=false) {
			clearTimeout(root.quotes.timeout);
			root.quotes.timeout = null;
			//qObj.nextQuote();
			$('#cmd .quotes').remove();
			$('#cmd .cmd').show();
			$('.window').height($(window).height() - $('#cmd').outerHeight());
			clearTimeout(root.cmd.idlemaster.timeout);
			root.cmd.idlemaster.timeout = setTimeout(root.cmd.idlemaster.run.bind(root.cmd.idlemaster), root.cmd.local.idle_time.val);
			if (!nofocus) root.cmd.el.focus();
		},
		init: function() {
			if (this.timeout !== null) return;
			this.current = Number(root.getLocal('quote.current'));
			if (this.total > 0) {
				$('#cmd > div.quotes').remove();
				$('#cmd').append('<div class="quotes"></div>');
				$('#cmd .cmd').hide();
				this.nextQuote();
			}
			//var qObj = this;
			$('.quotes').on('click', function(e) {
				root.quotes.close();
			});
		}
	},
	clearPast: function(el = false) {
		if (el === false) el = $('div[timerel]');
		el.each(function (index) {
			var $container = $(this);
			var precision = universes.earth.scale;
			var constants = [ { code:'\\hbar', title:'Planck\'s reduced constant' } ];
			var instability = { level: 9855, code:'', title:'' };
			var halflife = 1;
			var standard_limit = 1 / Math.pow(2, universes.solar_system.standard_proton.mass);
			//var stable_color = '#E6FFE6';
			//var past_color = '#FFEAEA';
			//var future_color = '#06f3';
			var stable_color  = 'stable';
			var past_color = 'past';
			var future_color = 'future';
			if (0) {	// DISABLED
				$(constants).each(function (index2) {
					if ($container.html().indexOf(this.code) >= 0) {
						++instability.level;
						instability.code += this.code;
						instability.title += (instability.title!=''?' &bullet; ':'')+this.title;
						halflife /= 2;
					}
				});
			}
			var curDate = new Date();
			var curYear = curDate.getFullYear();
			var curMonth = curDate.getMonth();
			var curDay = curDate.getDate();
			var yearOfProduction = ($(this).attr('timerel')!=''?$(this).attr('timerel'):curYear);
			var yearDif = curYear - yearOfProduction;
			var curColor = (yearDif > 0?past_color:(yearDif<0?future_color:stable_color));
			var currency = 1;
			$(universes.earth.cycles).each(function (index3) {
				if (this <= yearOfProduction) {
					currency = (yearOfProduction - this) / (universes.earth.cycles[index3-1] - this);
					return false;
				}
			});
			var currency_txt = (!currency?'current':'stale<sup>'+Number.parseFloat(1 - currency).toFixed(precision)+'</sup>');
			//$(this).css('background-color', curColor);
			$(this).addClass(curColor);
			if (halflife < 1) {
				var un = $('<div class="info_bar"><span title="Rust in peace">&#9762;</span> This information is '+currency_txt+' ('+yearOfProduction+'.) and unstable (half-life: <span title="'+(halflife==standard_limit?'Megadeth':halflife)+'">&#'+instability.level+';</span>, code: <span title="'+instability.title+'">\\('+instability.code+'\\)</span>)</div>');
				un.insertBefore($(this));
			}
			var innerEl = $('<div></div>');
			$(this).wrapInner(innerEl);
			$("div:not('.update')", this).fadeTo('slow', halflife);
			if (halflife < standard_limit) $(this).fadeOut();
		});
	},
	unclearPast: function(el = false) {
		if (el === false) el = $('div[timerel]');
		el.each(function (index) {
			//$(this).css('background-color', '');
			$(this).removeClass('stable').removeClass('future').removeClass('past');
			if ($(this).attr('style') == '') $(this).removeAttr('style');
			$(this).prev('.info_bar').remove();
			if ($('> div', $(this)).contents().length > 0)
				$('> div', $(this)).contents().unwrap();
			else
				$('> div', $(this)).remove();
		});
	},
	buildDescOvers: function() {
		$('*[desc]').on('mouseover', function(e) {
			let saywhat = $(this).attr('desc').stripTags();
			if (saywhat.indexOf('|') >= 0) {
				let arr = saywhat.split('|');
				saywhat = arr[Math.round(Math.random())];
			}
			if ($(this).attr('shuffle')) saywhat = saywhat.shuffloid();
			root.cmd.say(saywhat+"\n", false, true);
		});
	},
	buildLocalLinks: function() {
		$('a[noref]').each(function(index) {
			if ($(this).attr('ignore_build_local')) return;
			if ($(this).attr('href').indexOf('://') < 0 && $(this).attr('href').indexOf('#') < 0) {
				$(this).on('click', function(e) {
					e.preventDefault();
					root.load($(this).attr('href'));
				});
			}
		});
	},
	buildLocalLinksOnEl: function(el) {
		$('a[noref]', el).each(function(index) {
			if ($(this).attr('ignore_build_local')) return;
			if ($(this).attr('href').indexOf('://') < 0 && $(this).attr('href').indexOf('#') < 0) {
				$(this).on('click', function(e) {
					e.preventDefault();
					root.load($(this).attr('href'));
				});
			}
		});
	},
	buildFigures: function() {	// Builds a list of figures, not used by default, enable with tag <build_figures>1</build_figures>
		if (this.build_figures < 1) return false;
		var figures = [], i = 0, j = 0, $el, $next, $idx;
		console.log('Building Figures');
		$('body div.spirit').each(function (index) {
			//j = i;
			$('div.img', $(this)).each(function (idx) {
				$next = $(this).next();
				$idx = '';
				/*$(this).prev().each(function (idx2) {
					if ($(this).hasAttribute('idx')) $idx = $(this).attr('idx');
				});*/
				$idx = $(this).prevAll('[idx]').last().attr('idx');
				$el = $(this);
				let tries = 3;
				while (typeof($idx) == 'undefined' && tries-- > 0) {
					$el = $el.parent();
					$idx = $el.prevAll('[idx]').last().attr('idx');
				}
				if (typeof($idx) == 'undefined') $idx = '';
				$('a', $(this)).each(function (idx2) {
					figures[i++] = { idx: $idx, href: $(this).attr('href'), title: '' };
					if ($next.hasClass('imgsub')) figures[i-1].title = $next.text();
				});
			});
			/*$('div.imgsub', $(this)).each(function (idx) {
				if (typeof(figures[j]) == 'object')
					figures[j++].title = $(this).html();
			});*/
		});
		/*console.log('FIGURES:');
		console.log(figures);*/
		var table = $('<table></table>');
		$(figures).each(function (idx, val) {
			table.append($('<tr><td style="text-align:left"><b>'+val.idx.replace(/\.0$/, '')+'</b> '+val.title+'</td><td><a href="'+val.href+'" noref="1">'+(val.href.indexOf('/')==0?location.origin+val.href:val.href)+'</a></td></tr>'));
		});
		$('div#figures').remove();
		if (1 || typeof($('#figures').html()) == 'undefined') {
			let el = $('<div id="figures" class="spirit figures noformat"></div>');
			el.append($('<h2>List of figures</h2><br>'));
			el.append(table);
			if (typeof($('div.footer').html()) != 'undefined')
				el.insertBefore($('div.footer'));
			else
				$('body').append(el);
		}
	},
	buildChangeLog: function() {
		var updates = [], cur_date, i = 0;
		console.log('Building Change Log');
		$('body div.update').each(function (index) {
			//cur_date = ($(this).hasAttribute('date')?$(this).attr('date'):i++);
			if ($(this).hasAttribute('date')) {
				$(this).attr('id', i);
				updates.push({ id: i++, date: $(this).attr('date'), val: $(this).html(), nolink: ($(this).hasAttribute('nolink'))});
			}
		});
		//console.log(updates);
		if (updates.length < 1) return;
		updates.sort((a,b) => b.date.localeCompare(a.date));
		var table = $('<table></table>');
		$(updates).each(function (idx, val) {
			table.append($('<tr><td>'+val.date+'</td><td>'+(val.nolink?'':'<a class="creflink" href="#" data_id="'+val.id+'" noref="1"><sup>'+(idx+1)+'</sup></a>')+val.val+'</td></tr>'));
		});
		$('div#changelog').remove();
		if (1 || typeof($('#changelog').html()) == 'undefined') {
			let el = $('<div id="changelog" class="spirit changelog noformat"></div>');
			el.append($('<h2 no_numbering="1">Change Log</h2><br>'));
			el.append(table);
			if (typeof($('div.footer').html()) != 'undefined')
				el.insertBefore($('div.footer'));
			else
				$('body').append(el);
		}
		$('div#changelog a.creflink').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var el = 'div.update[id="'+($(this).attr('data_id'))+'"]';
			$(el).addClass('highlight').fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
			window.setTimeout(function() {
				$(el).removeClass('highlight').fadeOut('slow');
			}, 11 * 1000);
			window.setTimeout(function() {
				$(el).scrollToMe();
			}, 640);
			return false;
		});

	},
	buildCiteContrib: function() {
		console.log('Building Cite and support');
		let title = $('body > div.main_head > h1').html().replace('<div>', '<div>: ').stripTags();
		let table = $('<table></table>');
		let authors = '';
		/*$(this.latex.authors).each(function (idx) {
			authors += (authors!=''?', ':'')+this.name;
		});*/
		if (this.latex.authors.length > 0) authors = this.latex.authors[0].name.replace(/\b([A-Z])[A-Za-z0-9\-_]+\s+/g, '$1. ');
		if (this.latex.authors.length > 1) authors += ' et al';
		var cite = title + (this.latex.cite.year.length > 0?' ('+this.latex.cite.year+')':'') + (authors!=''?', '+authors:'');
		let cite_url = location.href.replace(/[\?#].*$/, '');
		if (this.latex.cite.doi.length > 0) cite_url += '<br noformat><br noformat>'+this.latex.cite.doi;
		//table.append($('<tr><td>How to cite: </td><td>'+cite+'<br noformat>'+cite_url+'</td></tr>'));
		let tr = $('<tr></tr>');
		tr.append($('<td></td>').html('How to cite: '));
		let td = $('<td></td>').html(cite);
		let btn_copy = $('<input>').attr('id', 'btn_cite_copy').attr('type', 'button').val('Copy').css({'margin-left': '8px', 'font-size': '11px'});
		let btn_copy_html = $('<input>').attr('id', 'btn_cite_copy_html').attr('type', 'button').val('Copy as HTML').css({'margin-left': '8px', 'font-size': '11px'});
		td.append(btn_copy);
		td.append(btn_copy_html);
		tr.append(td.html(td.html()+'<br noformat>'+cite_url));
		table.append(tr);
		if (this.latex.cite.contrib.length > 0)
			table.append($('<tr><td>How to contribute: </td><td>'+this.latex.cite.contrib.stripTags().replace(/(https?:\/\/[^\s\r\n]+)/g, '<a href="$1" noref="1">$1</a>')+'</td></tr>'));
		$('div#citecontrib').remove();
		let el = $('<div id="citecontrib" class="spirit citecontrib noformat"></div>');
		el.append($('<h2 no_numbering="1">Cite and support</h2><br>'));
		el.append(table);
		if (typeof($('div.footer').html()) != 'undefined')
			el.insertBefore($('div.footer'));
		else
			$('body').append(el);
		$('body input#btn_cite_copy').on('click', function(e) {
			e.preventDefault();
			navigator.clipboard.writeText(cite).then(function () {
				console.log(cite+' copied to clipboard.');
				root.cmd.say('"'+cite+'" copied to clipboard.')
			}, function () {
				console.error('Failure to copy. Check permissions for clipboard')
			});
		});
		$('body input#btn_cite_copy_html').on('click', function(e) {
			e.preventDefault();
			let txt = '<a href="'+location.href.replace(/[\?#].*$/, '')+'" data-notitle="1" title="'+cite.htmlentities()+'">'+cite.htmlentities()+'</a>';
			navigator.clipboard.writeText(txt).then(function () {
				console.log('HTML citation copied to clipboard.');
				root.cmd.say('HTML citation copied to clipboard.')
			}, function () {
				console.error('Failure to copy. Check permissions for clipboard')
			});
		});
	},
	buildDiscussions: function(pg=1, doScr=false) {
		var curpage = location.href.replace(/[\?#].*$/, '');
		if (curpage.match(/\.html?$/) === null) return;
		curpage = curpage.replace(/^.*?\/\/[^\/]+\/(.*)$/, '$1');
		var tmpstr = '&id='+root.cmd.local.id.val+(typeof(root.cmd.local.id.ph) != 'undefined'?'&ph='+root.cmd.local.id.ph:'');
		console.log('Building Discussions');
		if (pg == 0) {
			$('div#discussions').remove();
			var el = $('<div id="discussions" class="spirit discussions noformat"></div>');
			el.append($('<h2 no_numbering="1">Discussion and comments</h2><br>'));
			if (typeof($('div.footer').html()) != 'undefined')
				el.insertBefore($('div.footer'));
			else
				$('body').append(el);
		}
		else
			var el = $('div#discussions');
		$('div.comments', el).remove();
		$('div.pagelist', el).remove();
		if (pg == 0) return;
		fetch('/discussions/disc.php?cmd=get'+tmpstr+'&db='+encodeURIComponent(curpage)+'&pg='+pg)
		.then(
			function(response) {
				if (response.status != 200) {
					console.warn('DISCUSSIONS.fetch() ERROR: '+response.status);
					return;
				}
				response.text().then(function (data) {
					if (data == '-1') return false;
					if (1 || typeof($('#discussions').html()) == 'undefined') {
						el.append(data);
						$('div.comments div.msg_block div.cmt_msg', el).each(function (idx) {
							let x = $(this);
							x.html(x.html().replace(/\<x\>/g, '<p class="equation">').replace(/\<\/x\>/g, '</p>'));
							x.html(x.html().replace(/\>\n+\</g, '><').replace(/([^.\?\s\>]\s*)\n+/g, '$1').replace(/\n/g, '<br>').replace(/\t([^\<])/g, '<span class="indent"></span>$1').replace(/\n*(\<\/h[0-9]+\>)\n*(\<br\>)?\s*(\<span class="indent"\>\<\/span\>)?([^\<]+)/g, '$1<br><span class="indent"></span>$4').replace(/(\<\/h[134567890]\>)\<br\>/g, '$1').replace(/(ul|li|table)\>\<br\>/g, '$1>'));
							x.html(x.html().replace(/\n*(\<br\>[\s\r\n]*|\<span class="indent"\>\<\/span\>[\s\r\n]*)+\<table/g, '<table'));
							//x.html(x.html().replace(/\<br\>([A-ZČĆŽŠĐ])/g, "<br><br><span class=\"indent\"></span>$1"));
							x.html(x.html().replace(/\>\<br\>\<br\>/g, ">"));
						});
						if (data.match(/\<(e|x)\>/) !== null)
							MathJax.Hub.Queue(["Typeset", MathJax.Hub, $('#discussions div.comments')[0]]);
						if (pg == 'last' && typeof($('div.comments div.reply_block', el).html()) != 'undefined')
							$('div.comments div.reply_block', el).scrollToMe();
						else if (pg != 1 || doScr)
							$('div.comments', el).scrollToMe();
					}
					$('div#discussions div.pagelist > a').on('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						root.buildDiscussions($(this).attr('data-pg'), true);
						return false;
					});
					$('div#discussions div.comments div.msg_block div.thumbs a').on('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						tmpstr = '&id='+root.cmd.local.id.val+(typeof(root.cmd.local.id.ph) != 'undefined'?'&ph='+root.cmd.local.id.ph:'');
						var msg_id = $(this).attr('data-msg-id');
						fetch('/discussions/disc.php?cmd=thumb'+tmpstr+'&db='+encodeURIComponent(curpage)+'&msg_id='+msg_id+'&thumb='+$(this).attr('data-thumb'))
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('DISCUSSIONS.THUMB.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									if (data == '-1')
										root.cmd.say('Invalid user or document data. Not logged in?');
									else if (data == '-3')
										root.cmd.say('Comments disabled.');
									else if (data.match(/^[0-9]+\,[0-9]+/)) {
										let tmparr = data.split(',');
										$('div#discussions div.comments div.msg_block[data-id="'+msg_id+'"] div.thumbs span[data-id="tup"]').html(tmparr[0]);
										$('div#discussions div.comments div.msg_block[data-id="'+msg_id+'"] div.thumbs span[data-id="tdown"]').html(tmparr[1].trim());
									}
									else
										root.cmd.say('Something went wrong.');
									return false;
								});
							}
						)
						.catch(function(err) {
							console.error('DISCUSSIONS.THUMB.fetch() NETWORK ERROR: '+err);
						});
						return false;
					});
					$('div#discussions div.comments div.msg_block div.cmt_header a.msg_remove').on('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						tmpstr = '&id='+root.cmd.local.id.val+(typeof(root.cmd.local.id.ph) != 'undefined'?'&ph='+root.cmd.local.id.ph:'');
						var msg_id = $(this).attr('data-msg-id');
						fetch('/discussions/disc.php?cmd=remove'+tmpstr+'&db='+encodeURIComponent(curpage)+'&msg_id='+msg_id)
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('DISCUSSIONS.REMOVE.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									if (data == '-1')
										root.cmd.say('Invalid user or document data. Not logged in?');
									else if (data == '1')
										$('div#discussions div.comments div.msg_block[data-id="'+msg_id+'"]').remove();
									else if (data == '0')
										root.cmd.say('DB Error.');
									else
										root.cmd.say('Something went wrong.');
									return false;
								});
							}
						)
						.catch(function(err) {
							console.error('DISCUSSIONS.REMOVE.fetch() NETWORK ERROR: '+err);
						});
						return false;
					});
					$('div#discussions div.comments input#post_reply').on('click', function(e) {
						let post_data = { msg: $('div#discussions div.comments textarea[name="msgbox"]').val().trim() };
						var fd = new FormData();
						for (var x in post_data)
							fd.append(x, post_data[x]);
						tmpstr = '&id='+root.cmd.local.id.val+(typeof(root.cmd.local.id.ph) != 'undefined'?'&ph='+root.cmd.local.id.ph:'');
						fetch('/discussions/disc.php?cmd=post'+tmpstr+'&db='+encodeURIComponent(curpage), {
							method: 'post',
							body: fd
						})
						.then(
							function(response) {
								if (response.status != 200) {
									console.warn('DISCUSSIONS.POST.fetch() ERROR: '+response.status);
									return;
								}
								response.text().then(function (data) {
									if (data == '-1')
										root.cmd.say('Invalid user or document data. Not logged in?');
									else if (data == '-2')
										root.cmd.say('Message too long.');
									else if (data == '-3')
										root.cmd.say('Comments disabled.');
									else if (data == '1')
										root.buildDiscussions('last');
									else if (data == '0')
										root.cmd.say('DB Error.');
									else
										root.cmd.say('Something went wrong.');
									return false;
								});
							}
						)
						.catch(function(err) {
							console.error('DISCUSSIONS.POST.fetch() NETWORK ERROR: '+err);
						});
					});
					$('div#discussions div.comments div.reply_block div.cmt_header input.emos_cmds').on('click', function(e) {
						let oldEditable = root.editable.editable_box;
						root.editable.editable_box = $('div#discussions div.comments div.reply_block div.cmt_msg textarea');
						//insertMetachars: function(sStartTag, sEndTag, onEmpty)
						root.editable.insertMetachars('<'+$(this).attr('data-cmd')+'>'+($(this).hasAttribute('data-begin')?$(this).attr('data-begin'):''), ($(this).hasAttribute('data-end')?$(this).attr('data-end'):'')+'</'+$(this).attr('data-cmd')+'>');
						root.editable.editable_box = oldEditable;
					});
					return false;
				});
			}
		)
		.catch(function(err) {
			console.error('DISCUSSIONS.fetch() NETWORK ERROR: '+err);
		});
	},
	buildReferences: function() {
		//if (root.cmd.el_system) root.cmd.say('Building references...');
		var refs_el = $('<ol></ol>'), refs = '', tmp = '', tmp2 = '', id_set=0, ref_cnt=0, ref_link, refs_obj;
		root.latex.refs = [];
		$('body a').each(function (index) {
			refs_obj = { id: 0, item: '', url: ''};
			if ($(this).attr('download') || $(this).attr('noref') || $(this).text() == '') return;	// continue
			refs = ($(this).attr('data-notitle')?'':$(this).text().capitalize())+'<a class="reflink" id="bref'+(++ref_cnt)+'" href="#ref'+ref_cnt+'" idx="'+ref_cnt+'"><sup>'+ref_cnt+'</sup></a>';
			refs_obj.id = ref_cnt;
			tmp = $(this)[0];
			if ($(this).prev('h4, h3, h2')) {
				$(this).prev('h4, h3, h2').attr('id', 'ref'+ref_cnt);
				id_set = 0;
			}
			if (!id_set) {
				$('h3').each(function (index1) {
					tmp2 = $(this);
					$(this).nextUntil('h4, h3, h2').each(function(index2) {
						if ($(this)[0] == tmp) {
							//console.log($(this)[0]);
							tmp2.attr('id', 'ref'+ref_cnt);
						}
					});
				});
			}
			/*
			tmp = $(this).parent().contents().filter(
				function(){
					return this.nodeType === 3 && this.nodeValue.trim() !== '' && $(this).prevAll('li').length === 0;
				}).text();
			if (/^\s\(.+\,.+$/.test(tmp)) refs += tmp;
			*/
			if ($(this).attr('title')) refs += ($(this).attr('data-notitle')?'':' ')+$(this).attr('title');
			refs_obj.item = refs.stripTags(1);
			ref_link = $(this).attr('href');
			if (ref_link != '') {
				if (ref_link.indexOf('/') == 0) ref_link = location.origin+ref_link;
				refs_obj.url = ref_link;
				refs += '<br><a href="'+$(this).attr('href')+'" noref="1">'+ref_link+'</a>';
			}
			refs_el.append($('<li>'+refs+'<br><br></li>'));
			root.latex.refs.push(refs_obj);
			if ($(this).attr('href') == '') $(this).attr('href', '#bref'+ref_cnt);
			$(this).after('<a id="ref'+ref_cnt+'" class="reflink"'+($(this).attr('title')?' title="'+$(this).attr('title')+'"':'')+($(this).attr('data-notitle')?' data-notitle="'+$(this).attr('data-notitle')+'"':'')+' href="'+$(this).attr('href')+'" noref="1"><sup>'+ref_cnt+'</sup></a>');
			$(this).replaceWith('<div class="sref inline" idx="'+ref_cnt+'">'+$(this).html()+'</div>');
		});
		if (ref_cnt < 1) {
			if (!$('#references').parent('.references').hasClass('noshow')) $('#references').parent('.references').addClass('noshow');
			return;
		}
		if (typeof($('#references').html()) == 'undefined') {
			let el = $('<div class="spirit references noformat"></div>');
			el.append($('<h2>References</h2><br>'));
			el.append($('<div id="references"></div>'));
			if (typeof($('div.footer').html()) != 'undefined')
				el.insertBefore($('div.footer'));
			else
				$('body').append(el);
		}
		else if ($('#references').parent('.references').hasClass('noshow')) $('#references').parent('.references').removeClass('noshow');
		$('#references').append(refs_el);
		$('#references a.reflink').on('click', function(e) {
			var el = 'div.sref[idx="'+($(this).attr('idx'))+'"]';
			$(el).addClass('highlight').fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
			window.setTimeout(function() {
				$(el).removeClass('highlight');
			}, 11 * 1000);
			window.setTimeout(function() {
				$(el).scrollToMe();
			}, 640);
		});
	},
	unbuildReferences: function() {
		//if (root.cmd.el_system) root.cmd.say('Unbuilding references...')
		$('#references').html('');
		var el, html;
		$('body div.sref').each(function (index) {
			if (!$(this).hasClass('inline')) return;	// continue
			el = $(this).next('a.reflink');
			if (typeof(el) == 'undefined' || el === null) return;	// continue
			html = $(this).html();
			$(this).replaceWith('<a href="'+(el.attr('href').indexOf('#bref')==0?'':el.attr('href'))+'"'+(el.attr('data-notitle')?' data-notitle="'+el.attr('data-notitle')+'"':'')+(el.attr('title')?' title="'+el.attr('title')+'"':'')+'>'+html+'</a>');
			el.remove();
		});
	},
	sreferences : {
		body: '#sreferences',
		entities: [],
		total: 0,
		init: function() {
			this.entities = [];
			if (typeof($(this.body).html()) == 'undefined') return;
			var items = $(this.body).html().trim().split("\n");
			this.total = items.length;
			var $this = this, item, obj, myRegexp;
			$(items).each(function (idx) {
				if (this.indexOf(',') < 0) return;	// continue
				item = this.split(',');
				let item_cnt = item.length;
				obj = { title: item[0].trim(), year: 0, messenger: item[item_cnt-1].trim() };
				if (item_cnt > 2) obj.title += ', '+item[1].trim();
				myRegexp = /^(.+)\(([^\)]+)\)$/;
				item = myRegexp.exec(obj.title);
				if (item !== null && typeof(item[2]) != 'undefined') { obj.year = item[2]; obj.title = item[1].trim(); }
				$this.entities.push(obj);
			});
			console.log(this.entities);
			this.enumerate();
		},
		enumerate: function() {
			var body = this.body, refs_el = $('<ol></ol>'), ref = '', myRegexp, myRegexp2, i = 0;
			$(body).html('');
			$(this.entities).each(function (idx) {
				ref = this.title+(this.year != 0?' ('+this.year+')':'')+', '+this.messenger;
				refs_el.append($('<li><a class="reflink" href="#ssref'+(++i)+'" idx="'+i+'" id="sref'+i+'" noref="1"><sup>'+i+'</sup></a>'+ref+'<br><br></li>'));
				myRegexp = new RegExp('('+this.title.escapeRegExp()+')([^a-z0-9\-])', 'gi');
				myRegexp2 = new RegExp('(\>[^\<]*)('+this.title.escapeRegExp()+')([^a-z0-9\-])', 'gi');
				//console.log(myRegexp);
				/*$('body').html($('body').html().replace(myRegexp, '$1<a href="#sref'+i+'" class="reflink"><sup>'+i+'</sup></a>'));*/
				$('body').contents().each(function () {
					if (this.nodeType === 3)
						this.nodeValue = $.trim($(this).text()).replace(myRegexp, '<div class="ssref inline" idx="'+i+'">$1</div><a href="#sref'+i+'" id="ssref'+i+'" class="reflink" data-type="ssref" noref="1"><sup>'+i+'</sup></a>$2');
					/* CAN BREAK HTML! (fixed with myRegexp2?) */
					else if (this.nodeType === 1) $(this).html( $(this).html().replace(myRegexp2, '$1<div class="ssref inline" idx="'+i+'">$2</div><a href="#sref'+i+'" id="ssref'+i+'" class="reflink" data-type="ssref" noref="1"><sup>'+i+'</sup></a>$3') );
				});
				if (typeof($('body a[id="ssref'+i+'"]').html()) == 'undefined') $('a[id="sref'+i+'"]', refs_el).remove();
			});
			$(body).append(refs_el);
			$(body+' a.reflink').on('click', function(e) {
				var el = 'div.ssref[idx="'+($(this).attr('idx'))+'"]';
				$(el).addClass('highlight').fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
				window.setTimeout(function() {
					$(el).removeClass('highlight');
				}, 11 * 1000);
				window.setTimeout(function() {
					$(el).scrollToMe();
				}, 640);
			});
		}
	},
	views : {
		views: [],
		current: 0,
		total: 0,
		add: function() {
			var el = $('<div id="view'+this.total+'" class="view"></div>');
			this.views.push(el);
			root.wins.addView(this.total);
			return this.total++;
		},
		remove: function(id = -1) {
			if (id < 0) id = this.current;
			$('div#view'+id).remove();
			this.views[id] = undefined;
			if (id == this.current) this.current = (this.current + 1) % this.total;
			return this.current;
		},
		removeAll: function() {
			$(this.views).each(function(idx) {
				root.views.remove(idx);
			});
			this.views = [];
			this.total = 0;
			this.current = 0;
		},
		fix: function(id = null) {
			if (id === null) id = this.current;
			if (typeof(this.views[id]) == 'undefined') id = this.add();
			var top = 0, first_nonfixed = null;
			$('div#view'+id).parent().children('.view').each(function (idx) {
				if ($(this).css('position') == 'fixed') top += $(this).height();
				else if (first_nonfixed === null)
					first_nonfixed = $(this).attr('id');
			});
			//, left: $('div#view'+id).parent().position().left
			$('div#view'+id).css({'position': 'fixed', 'top': top, 'background-color': 'rgba(255, 255, 255, 0.99)'});
			$('div#view'+id).attr('fixed', '1');
			$('div#view'+id).width($('div#'+first_nonfixed).width());
			top += $('div#view'+id).height();
			if (first_nonfixed !== null)
				$('div#'+first_nonfixed).css('margin-top', top+'px');
			if (typeof(root.observers['window'+root.wins.current+'view']) == 'undefined') {
				root.observers['window'+root.wins.current+'view'] = new MutationObserver(function(mutations) {
					//console.log('mutations:', mutations);
					for(var mutation of mutations) {
						if (mutation.type == 'childList') {
							//console.log('A child node has been added or removed.');
							var top = 0, first_nonfixed = null;
							$('div#'+mutation.target.id).parent().children('.view').each(function (idx) {
								if ($(this).css('position') == 'fixed') top += $(this).height();
								else if (first_nonfixed === null)
									first_nonfixed = $(this).attr('id');
							});
							if (first_nonfixed !== null)
								$('div#'+first_nonfixed).css('margin-top', top+'px');
						}
					}
				});
			}
			let child = document.querySelector('div#view'+id);
			root.observers['window'+root.wins.current+'view'].observe(child, { childList: true });
			return id;
		},
		clear: function(id = -1) {
			if (id < 0) id = this.current;
			this.views[id].html('');
		},
		update: function(content, id = null) {
			return this.append(content, id, true);
		},
		append: function(content, id = null, clear = false) {
			if (id === null) id = this.current;
			else if (id.length > 0 && id.match(/[0-9]+\.fix$/i))
				id = this.fix(id.replace(/\.fix$/i, ''));
			else if (typeof(this.views[id]) == 'undefined') id = this.add();
			if (clear) this.clear(id);
			this.views[id].append(content);
			return id;
		}
	},
	wins : {
		wins: [],
		current: 0,
		total: 0,
		remove_all_on_init: 1,
		remove_all_views_on_init: 1,
		add: function() {
			var el = $('<div id="window'+this.total+'" class="window"></div>');
			this.wins.push(el);
			return this.total++;
		},
		remove: function(id = -1) {
			if (id < 0) id = this.current;
			$('div#window'+id).remove();
			this.wins[id] = undefined;
			if (id == this.current) this.current = (this.current + 1) % this.total;
			return this.current;
		},
		removeAll: function() {
			$(this.wins).each(function(idx) {
				root.wins.remove(idx);
			});
			this.wins = [];
			this.total = 0;
			this.current = 0;
		},
		clear: function(id = -1) {
			if (id < 0) id = this.current;
			this.wins[id].html('');
		},
		update: function(content, id = null) {
			return this.append(content, id, true);
		},
		append: function(content, id = null, clear = false) {
			if (id === null) id = this.current;
			if (typeof(this.wins[id]) == 'undefined') id = this.add();
			if (clear) this.clear(id);
			this.wins[id].append(content);
			return id;
		},
		addView: function(id_view = null, id = null) {
			if (id_view === null)
				id_view = root.views.add();
			if (id === null)
				id = this.current;
			this.wins[id].append(root.views.views[id_view]);
			return id;
		},
		alignBody: function() {
			$('body, div.loading_body').css('margin-left', $('.window').outerWidth());
			$('.window').css('max-height', $(window).height() - $('#cmd').outerHeight());
		},
		init: function() {
			if (this.remove_all_on_init > 0) {
				root.views.removeAll();
				this.removeAll();
				var el = this.wins[this.add()];
				var close = $('<div class="close_button">&times;</div>');
				el.append(close);
				el.append($('.main_head').html());
				this.addView();
				//el.css('max-height', $(window).height() - $('#cmd').outerHeight());
				//el.css('height', $(window).height() - $('#cmd').outerHeight());
				//$('html').prepend(el);	// menu should be first
				el.insertAfter($('head'));
				$('body').css('margin-left', el.outerWidth());
				$('html').css('text-align', 'left');
				root.observers['window'] = new MutationObserver(function(mutations) {
					//console.log('mutations:', mutations);
					for(var mutation of mutations) {
						if (mutation.type == 'childList') {
							//console.log('A child node has been added or removed.');
						}
						else if (mutation.type == 'attributes') {
							if (mutation.target.className == 'window' && mutation.attributeName == 'style') {
								$('body').css('margin-left', $('.window').outerWidth());
								$('.window').css('max-height', $(window).height() - $('#cmd').outerHeight());
								var first_nonfixed = null;
								$('.view', $('#'+mutation.target.id)).each(function (idx) {
									if (!($(this).hasAttribute('fixed'))) {
										first_nonfixed = $(this).attr('id');
										return false;
									}
								});
								if (first_nonfixed !== null)
									$('.view[fixed]', $('#'+mutation.target.id)).width($('#'+first_nonfixed).width());
								else
									$('.view[fixed]', $('#'+mutation.target.id)).width($('#'+mutation.target.id).width());
							}	
						}
					}
				});
				let child = document.querySelector('div.window');
				root.observers['window'].observe(child, { attributes: true });
			}
			else {
				$('#window0 > h1:first-of-type').html($('.main_head > h1').html());
				$('#window0 > div:first-of-type:not(.view)').remove();
				if (typeof($('.main_head > div').html()) != 'undefined') {
					let el = $('.main_head > div').clone();
					el.insertAfter($('#window0 > h1:first-of-type'));
				}
				if (this.remove_all_views_on_init > 0) {
					root.views.removeAll();
					this.addView();
				}
				else
					root.views.clear();
			}
		}
	},
	summary : {
		entities: [],
		depth: 3,	//h2,h3,h4	(currently unused, depth is always 3)
		body_numbering: 1,
		params: {
			expand_all: { val: false, 'default': false },
			state: {
				false: { val: '+', 'default': '+' },
				true: { val: '-', 'default': '-' }
			}
		},
		getSpirit: function(id) {
			var tmp, tmp2;
			if (!id.match(/^[0-9\.]+$/)) {
				//define(what = false, silent = false, only_first = false, only_defs = true)
				tmp = root.cmd.cmds.define.exec(id, true, true, false);
				if (tmp === false) return false;
				id = String(tmp.idx);
				if (typeof(tmp.parent_idx) != 'undefined') id = tmp.parent_idx+'.'+id;
				if (typeof(tmp.parent_parent_idx) != 'undefined') id = tmp.parent_parent_idx+'.'+id;
			}
			else 
				id = id.replace(/\.+$/, '');
			tmp = id.split('.').length;
			while (tmp++ < 3)
				id += '.0';
			tmp2 = id.split('.');
			tmp = 4;
			$(tmp2).each(function(idx) {
				if (this == '0') --tmp;
			});
			return $('body h'+tmp+'[idx="'+id+'"]').parent();
		},
		val: function(param, param2 = null) {	// make this globally inherited
			if (param2 === null)
				return this.params[param].val;
			return this.params[param][param2].val;
		},
		clearBodyNumbering: function() {
			$('h2,h3,h4').each(function (idx) {
				$(this).html($(this).html().replace(/^\<span\>[0-9\.]+\<\/span\>\s+/, ''));
				/*
				$(this).nextUntil('h2', 'h3').each(function (idx2) {
					$(this).html($(this).html().replace(/^[0-9\.\s]+/, ''));
					$(this).nextUntil('h3', 'h4').each(function (idx3) {
						$(this).html($(this).html().replace(/^[0-9\.\s]+/, ''));
					});
				});*/
			});
		},
		clear: function() {
			this.entities = [];
			this.clearBodyNumbering();
		},
		build: function(onlyHeadNumbers = false) {
			console.log('BUILDING SUMMARY...');
			//this.buildBlocks(); moved to spirits
			var el, tmp, tmp2, $this = this, synonyms, i = 0, j = 0, k = 0;
			var only_strict_defs = false;
			this.clear();
			$('body .spirit').each(function(idx) {
				if ($(this).hasClass('noshow')) return;
				el = $(this).children().first();
				tmp = el.html();
				if (typeof(tmp) == 'undefined') return;
				synonyms = tmp.synonyms();
				if (synonyms.length > 0) {
					tmp = synonyms[0];
					tmp2 = '';
					synonyms.shift();
					$(synonyms).each(function(idx2) {
						//if (!idx2) return;
						tmp2 += (tmp2!=''?', ':'')+this;
					});
					$('<div class="synonyms">'+tmp2+'<div>relative synonyms</div></div>').insertAfter(el);
				}
				if (el.prop("tagName") == 'H2') {
					if (el.hasAttribute('no_numbering') && el.attr('no_numbering') == '1') {
						el.html(tmp);
						if (i > 0) ++i;
					}
					else
						el.html((1?'<span>'+(++i)+'.</span> ':'')+tmp);
					$this.entities[i-1] = { idx: i, title: tmp, synonyms: synonyms, entities : [] };
					if ($(this).attr('class') != 'spirit') {
						$this.entities[i-1].class = $(this).attr('class').replace(/^spirit\s+([^\s]+).*$/, '$1');
						if ($(this).hasClass('definitions')) $this.entities[i-1].defclass = 1;
					}
					/*
					else if (!$(this).hasClass('definitions')) {
						tmp2 = $(this).clone();
						tmp2.contents().filter('h2,.synonyms').remove().filter(function() { return this.nodeType === 3; }).wrap('<p></p>').end();
						tmp2 = tmp2.html().split('<br><br>');
						if (tmp2.length > 1) {
							$this.entities[i-1].def = tmp2[0];
							$this.entities[i-1].explain = '';
							$(tmp2).each(function(idx2) {
								if (idx2 < 1) return;
								$this.entities[i-1].explain += this + '<br><br>';
							});
							$this.entities[i-1].explain = $this.entities[i-1].explain.replace(/\<br\>\<br\>$/, '');
						}
						else {
							$this.entities[i-1].def = tmp2[0];
						}
					}*/
					el.attr('idx', i+'.0.0');
					el.attr('hash', tmp.replace(/\s*\[\s*\<a\s[^>]+>RUN<\/a>\s*\]\s*$/, '').stripTags(2).toLowerCase().hashCode());
					//if (onlyHeadNumbers) return;
					j = 0;
				}
				else if (el.prop("tagName") == 'H3') {
					el.html((1?'<span>'+i+'.'+(++j)+'.</span> ':'')+tmp);
					$this.entities[i-1].entities[j-1] = { idx: j, title: tmp, synonyms: synonyms, entities : [] };
					if ($(this).attr('class') != 'spirit')
						$this.entities[i-1].entities[j-1].class = $(this).attr('class').replace(/^spirit\s+([^\s]+).*$/, '$1');
					if (typeof($this.entities[i-1].class) != 'undefined' && (!only_strict_defs || typeof($this.entities[i-1].defclass) != 'undefined')) {
						if ($(this).has('.def').length) {
							$this.entities[i-1].entities[j-1].def = $(this).children('.def').html();
							$this.entities[i-1].entities[j-1].explain = $(this).children('.explain').html();
						}
						else {
							tmp2 = $(this).clone();
							tmp2.contents().filter('h3,.synonyms').remove().filter(function() { return this.nodeType === 3; }).wrap('<p></p>').end();
							tmp2 = tmp2.html().split('<br><br>');
							if (tmp2.length > 1) {
								$this.entities[i-1].entities[j-1].def = tmp2[0];
								$this.entities[i-1].entities[j-1].explain = '';
								$(tmp2).each(function(idx2) {
									if (idx2 < 1) return;
									$this.entities[i-1].entities[j-1].explain += this + '<br><br>';
								});
								$this.entities[i-1].entities[j-1].explain = $this.entities[i-1].entities[j-1].explain.replace(/\<br\>\<br\>$/, '');
							}
							else {
								$this.entities[i-1].entities[j-1].def = tmp2[0];
							}
						}
					}
					el.attr('idx', i+'.'+j+'.0');
					el.attr('hash', tmp.stripTags(2).toLowerCase().hashCode());
					//if (onlyHeadNumbers) return;
					k = 0;
				}
				else if (el.prop("tagName") == 'H4') {
					el.html((1?'<span>'+i+'.'+j+'.'+(++k)+'.</span> ':'')+tmp);
					$this.entities[i-1].entities[j-1].entities[k-1] = { idx: k, title: tmp, synonyms: synonyms, entities : [] };
					if ($(this).attr('class') != 'spirit')
						$this.entities[i-1].entities[j-1].entities[k-1].class = $(this).attr('class').replace(/^spirit\s+([^\s]+).*$/, '$1');
					if (typeof($this.entities[i-1].class) != 'undefined' && (!only_strict_defs || typeof($this.entities[i-1].defclass) != 'undefined')) {
						if ($(this).has('.def').length) {
							$this.entities[i-1].entities[j-1].entities[k-1].def = $(this).children('.def').html();
							$this.entities[i-1].entities[j-1].entities[k-1].explain = $(this).children('.explain').html();
						}
						else {
							tmp2 = $(this).clone();
							tmp2.contents().filter('h4,.synonyms').remove().filter(function() { return this.nodeType === 3; }).wrap('<p></p>').end();
							tmp2 = tmp2.html().split('<br><br>');
							if (tmp2.length > 1) {
								$this.entities[i-1].entities[j-1].entities[k-1].def = tmp2[0];
								$this.entities[i-1].entities[j-1].entities[k-1].explain = '';
								$(tmp2).each(function(idx2) {
									if (idx2 < 1) return;
									$this.entities[i-1].entities[j-1].entities[k-1].explain += this + '<br><br>';
								});
								$this.entities[i-1].entities[j-1].entities[k-1].explain = $this.entities[i-1].entities[j-1].entities[k-1].explain.replace(/\<br\>\<br\>$/, '');
							}
							else {
								$this.entities[i-1].entities[j-1].entities[k-1].def = tmp2[0];
							}
						}
					}
					el.attr('idx', i+'.'+j+'.'+k);
					el.attr('hash', tmp.stripTags(2).toLowerCase().hashCode());
					//if (onlyHeadNumbers) return;
					//l = 0;
				}
			});		
			//console.log(this.entities);
			root.memory.save_summary();
		},
		buildHTML: function(view_id = 0, update = false) {
			if (update && typeof($('.window #view'+view_id+' ul.dir').html()) == 'undefined') {
				if (this.body_numbering == 0) this.clearBodyNumbering();
				return;
			}
			var tmpel, tmpel2, tmpel3, tmpel4, state, state_code, i, j;
			$('.window #view'+root.views.current+' ul li[type]').off('click');
			$('.window #view'+root.views.current+' ul .expander').off('click');
			var ul = $('<ul class="dir"></ul>');
			$(this.entities).each(function (idx) {
				tmpel = ($('<li type="h2" idx="'+this.idx+'.0.0">'+(typeof(this.class) != 'undefined'?'<span class="'+this.class+'">':'')+this.idx.toString().padNumber()+'. '+this.title+(typeof(this.class) != 'undefined'?'</span>':'')+'</li>'));
				if (this.entities.length > 0) {
					state = root.summary.val('expand_all');
					state_code = root.summary.val('state', state);
					tmpel.append($('<div class="expander" state="'+(state?'1':'0')+'">'+state_code+'</div>'));
					tmpel2 = $('<ul'+(state?'':' style="display:none"')+'></ul>');
					i = this.idx;
					$(this.entities).each(function (idx2) {
						if (typeof(this.title) !== 'undefined') {
							tmpel3 = $('<li type="h3" idx="'+i+'.'+this.idx+'.0">'+(typeof(this.class) != 'undefined'?'<span class="'+this.class+'">':'')+i+'.'+this.idx+' '+this.title+(typeof(this.class) != 'undefined'?'</span>':'')+'</li>');
							tmpel2.append(tmpel3);
							if (this.entities.length > 0) {
								tmpel3.append($('<div class="expander" state="'+(state?'1':'0')+'">'+state_code+'</div>'));
								tmpel4 = $('<ul'+(state?'':' style="display:none"')+'></ul>');
								j = this.idx;
								$(this.entities).each(function (idx3) {
									if (typeof(this.title) !== 'undefined') {
										tmpel4.append($('<li type="h4" idx="'+i+'.'+j+'.'+this.idx+'">'+(typeof(this.class) != 'undefined'?'<span class="'+this.class+'">':'')+i+'.'+j+'.'+this.idx+' '+this.title+(typeof(this.class) != 'undefined'?'</span>':'')+'</li>'));
									}
								});
								tmpel3.append(tmpel4);
							}
						}
					});
					tmpel.append(tmpel2);
				}
				ul.append(tmpel);
				//root.buildLocalLinksOnEl(ul);	// done globally in root.afterMathjax()
			});
			if (update) {
				var opened_expanders = [];
				$('.window #view'+view_id+' ul.dir div.expander[state="1"]').each(function (index) {
					opened_expanders.push($(this).parent().attr('idx'));
				});
				$('.window #view'+view_id+' ul.dir').replaceWith(ul);
			}
			else
				root.views.append(ul, view_id);
			// put indexes on body expanders so we can expand them when the link in summary is clicked
			$('body div.expander').each(function(index) {
				let idx = '';
				if (typeof($('h2,h3,h4', $(this).next()).html()) != 'undefined' && $('h2,h3,h4', $(this).next()).hasAttribute('idx'))
					idx = $('h2,h3,h4', $(this).next()).attr('idx');
				$(this).attr('idx', idx);
			});
			root.memory.load_expander_states();	// load saved expander states for current page
			$('.window #view'+root.views.current+' ul li[type] > span').removeClass('editable');
			$('.window #view'+root.views.current+' ul li[type]').on('click', function(e) {
				e.stopPropagation();
				var type = $(this).attr('type');
				if (typeof($('body div.expander[idx="'+$(this).attr('idx')+'"]').html()) != 'undefined' && $('body div.expander[idx="'+$(this).attr('idx')+'"]').attr('state') == 0) {
					let $this = $('body div.expander[idx="'+$(this).attr('idx')+'"]');
					$this.trigger('click');
					let max_loops = 5;
					while (typeof($this = $this.closest('div.spirit')) != 'undefined' && max_loops-- > 0) {
						$this = $this.prev('div.expander');
						if (typeof($this) != 'undefined' && $this.attr('state') == 0)
							$this.trigger('click');
						else break;
					}
				}
				$('body '+type+'[idx="'+$(this).attr('idx')+'"]').scrollToMe();
			});
			$('.window #view'+root.views.current+' ul .expander').on('click', function(e) {
				e.stopPropagation();
				$(this).next().toggle();
				if ($(this).attr('state') == '1')
					$(this).attr('state', '0');
				else
					$(this).attr('state', '1');
				$(this).html(root.summary.val('state', ($(this).attr('state')=='0'?false:true)));
			});
			if (update) {
				$(opened_expanders).each(function (index) {
					$('.window #view'+view_id+' ul.dir li[idx="'+this+'"] > div.expander').trigger('click');
				});
			}
			if (this.body_numbering == 0) this.clearBodyNumbering();
		}
	},
	latex: {
		cls: 'article',
		authors: [],
		cite: { year: '', doi: '', contrib: ''},
		keywords: '',
		use_keywords: 0,	// put keywords in abstract?
		newline: "\r\n",
		vspace: '12pt',		// vertical space before and after notes (fboxes)
		font8bit: 1,		// use T1 font encoding
		utf8src: 1,			// specify UTF-8 encoding
		usecolorbox: 1,		// use tcolorbox instead of fbox for notes
		//packagez: ['authblk', 'amsfonts', 'amsmath', 'graphicx', 'caption', 'subfigure'],
		packagez: ['authblk', 'amsfonts', 'amsmath', 'graphicx', '[dvipsnames]{xcolor}', 'subcaption', 'makecell'],
		graphics_path: '',
		canvas_image_path: '/images/',
		refs: [],
		buildrefs: 1,
		download: function(filename, text) {
			let element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
			element.setAttribute('download', filename);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		},
		build: function(fname = '') {
			this.graphics_path = '';
			if (typeof(root.cmd.local.latex.graphics_path.val) != 'undefined')
				this.graphics_path = root.cmd.local.latex.graphics_path.val;
			let title = $('body > div.main_head > h1').html().replace('<div>', '<div>: ').stripTags();
			let filename = fname, eol = this.newline, tmparr = '';
			if (filename == '') filename = title.replace(/^([^:]+):.*$/, '$1').toLowerCase().replace(/[^a-z0-9]/g, '_');
			filename += '.tex';
			let date = new Date(), dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
			let [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat.formatToParts(date);
			let tex = '% '+filename+eol+'% generated on '+year+'.'+month+'.'+day+' by MATERRA v'+root.ver+eol+eol;
			let tmpstr = '', tmpstr2 = '', tmpstr3 = '', tmpstr4 = '', tmpvar;
			if (this.utf8src > 0) tmpstr += '\\usepackage[utf8]{inputenc}'+eol;
			$(this.packagez).each(function (idx) {
				if (this.indexOf('{') >= 0)
					tmpstr += '\\usepackage'+this+eol;
				else
					tmpstr += '\\usepackage{'+this+'}'+eol;
			});
			if (this.graphics_path != '') tmpstr += '\\graphicspath{'+this.graphics_path+'}'+eol;
			if (this.font8bit > 0) tmpstr += '\\usepackage[T1]{fontenc}'+eol+'\\usepackage{lmodern}'+eol;
			if (this.usecolorbox > 0) tmpstr += '\\usepackage[most]{tcolorbox}'+eol;
			tmpstr += eol+'\\newcommand*{\\email}[1]{%'+eol+'    \\normalsize{#1}\\par'+eol+'}'+eol;
			tmpstr += '\\newcommand\\tstrut{\\rule{0pt}{2.8ex}}'+eol+'\\newcommand\\bstrut{\\rule[-1.0ex]{0pt}{0pt}}'+eol;
			tmpstr += '\\definecolor{n5}{RGB}{128, 0, 0}'+eol;
			tmpstr += '\\definecolor{n4}{RGB}{128, 128, 0}'+eol;
			tmpstr += '\\definecolor{n3}{RGB}{0, 128, 0}'+eol;
			tmpstr += '\\definecolor{n2}{RGB}{0, 0, 128}'+eol;
			tmpstr += '\\definecolor{n1}{RGB}{219, 59, 12}'+eol;
			tex += '\\documentclass{'+this.cls+'}'+eol+eol+tmpstr+eol+'\\begin{document}'+eol+eol;
			tex += '\\title{'+title+'}'+eol+eol;
			$(this.authors).each(function (idx) {
				tex += '\\author{'+this.name+'}'+eol;
				if (this.address != '') {
					tex += '\\affil{'+this.address+(this.email!=''?' \\email{'+this.email+'}':'')+'}'+eol;
				}
				tex += eol;
			});
			let el = $('<div></div>');
			if (typeof($('body > div.abstract').html()) != 'undefined') {
				el.html($('body > div.abstract').html());
				$('h2', el).remove();
				tex += '\\begin{abstract}'+eol;
				tex += el.html().replace(/\<br[^\>]*\>/g, eol).latexize().niceLatex(eol).stripTags().trim()+eol;
				if (this.use_keywords > 0 && this.keywords != '') tex += eol+'\\vspace{32pt}{\\bf Keywords:} '+this.keywords+eol;
				tex += '\\end{abstract}'+eol;
			}
			else if (this.keywords != '') tex += '{\\bf Keywords:} '+this.keywords+eol;
			tex += '\\maketitle'+eol;
			let sub_el = '';
			$('body .spirit').each(function (idx) {
				if ($(this).hasClass('abstract') || $(this).hasClass('noshow') || $(this).hasClass('main_head') || $(this).hasClass('references') || $(this).hasClass('changelog') || $(this).hasClass('citecontrib') || $(this).hasClass('discussions') || $(this).hasClass('quotes')) return;	// continue
				el.html($(this).html());
				$('a[data-type="ssref"]', el).remove();
				sub_el = 'h2';
				if (typeof($(sub_el, el).html()) != 'undefined') {
					if ($(sub_el, el).hasAttribute('idx')) {
						$(sub_el, el).html($(sub_el, el).html().replace('<span>'+$(sub_el, el).attr('idx').replace(/\.0/g, '.').replace(/([0-9])$/, '$1.').replace(/\.+$/, '.')+'</span>', ''));
					}
					if (typeof($(sub_el, el).next().html()) != 'undefined' && $(sub_el, el).next().hasClass('synonyms')) {
						$(sub_el, el).html($(sub_el, el).html()+' ('+$(sub_el, el).next().html().replace(/<div>.*?<\/div>/g, '').trim()+')');
						$(sub_el, el).next().remove();
					}
					tex += eol+'\\section'+($(sub_el, el).hasAttribute('no_numbering')?'*':'')+'{'+$(sub_el, el).html().latexize().stripTags().trim()+'}'+eol;
					$(sub_el, el).remove();
				}
				sub_el = 'h3';
				if (typeof($(sub_el, el).html()) != 'undefined') {
					if ($(sub_el, el).hasAttribute('idx')) {
						$(sub_el, el).html($(sub_el, el).html().replace('<span>'+$(sub_el, el).attr('idx').replace(/\.0/g, '.').replace(/([0-9])$/, '$1.').replace(/\.+$/, '.')+'</span>', ''));
					}
					if (typeof($(sub_el, el).next().html()) != 'undefined' && $(sub_el, el).next().hasClass('synonyms')) {
						$(sub_el, el).html($(sub_el, el).html()+' ('+$(sub_el, el).next().html().replace(/<div>.*?<\/div>/g, '').trim()+')');
						$(sub_el, el).next().remove();
					}
					tex += eol+'\\subsection{'+$(sub_el, el).html().latexize().stripTags().trim()+'}'+eol;
					$(sub_el, el).remove();
				}
				sub_el = 'h4';
				if (typeof($(sub_el, el).html()) != 'undefined') {
					if ($(sub_el, el).hasAttribute('idx')) {
						$(sub_el, el).html($(sub_el, el).html().replace('<span>'+$(sub_el, el).attr('idx').replace(/\.0/g, '.').replace(/([0-9])$/, '$1.').replace(/\.+$/, '.')+'</span>', ''));
					}
					if (typeof($(sub_el, el).next().html()) != 'undefined' && $(sub_el, el).next().hasClass('synonyms')) {
						$(sub_el, el).html($(sub_el, el).html()+' ('+$(sub_el, el).next().html().replace(/<div>.*?<\/div>/g, '').trim()+')');
						$(sub_el, el).next().remove();
					}
					tex += eol+'\\subsubsection{'+$(sub_el, el).html().latexize().stripTags().trim()+'}'+eol;
					$(sub_el, el).remove();
				}
				sub_el = 'sub4';
				if (typeof($(sub_el, el).html()) != 'undefined') {
					$(sub_el, el).each(function (sidx) {
						if ($(this).hasAttribute('idx')) {
							$(this).html($(this).html().replace('<span>'+$(this).attr('idx').replace(/\.0/g, '.').replace(/([0-9])$/, '$1.').replace(/\.+$/, '.')+'</span>', ''));
						}
						if (typeof($(this).next().html()) != 'undefined' && $(this).next().hasClass('synonyms')) {
							$(this).html($(this).html()+' ('+$(this).next().html().replace(/<div>.*?<\/div>/g, '').trim()+')');
							$(this).next().remove();
						}
						//tex += eol+'\\paragraph{'+$(this).html().latexize().stripTags().trim()+'}'+eol;
						$(this).html(eol+'\\paragraph{'+$(this).html().latexize().stripTags().trim()+'}'+eol);
						//$(this).remove();
					});
				}
				if (typeof($('p.equation', el).html()) != 'undefined') {
					$('p.equation', el).each(function (eidx) {
						if ($(this).parent().prop('tagName') == 'TD' || $(this).hasClass('inline'))
							$(this).html($(this).html().replace(/^[\s\S]*<script[^>]+type="math\/tex"[^>]*>([\s\S]+?)<\/script>[\s\S]*$/, '$$$1$$'));
						else
							$(this).html($(this).html().replace(/^[\s\S]*<script[^>]+type="math\/tex"[^>]*>([\s\S]+?)<\/script>[\s\S]*$/, '$$$$$1$$$$'));
						if ($(this).html().indexOf('\\tag{') >= 0) {
							$(this).html($(this).html().replace(/^\$\$(.*?)\\tag\{([^\}]+)\}(.*?)\$\$$/, '\\begin{equation}\\tag{$2}\\label{eq:$2}$1$3\\end{equation}'));
						}
						$(this).html($(this).html().replace(/\\style\{color:([^\}]*)\}/g, '\\textcolor{$1}').replace(/\\(text|)color{green}/g, '\\textcolor{OliveGreen}'));
					});
				}
				el.html(el.html().replace('&nbsp;', ' ').replace('&amp;', '&').replace('& ', '\\& ').replace('#', '\\#').replace(/([^\\])%/g, '$1\\%'));
				$('div.right,p.right', el).each(function(ridx) {					
					$(this).html('\\begin{flushright}'+eol+$(this).html().replace('{', '\\{').replace('}', '\\}')+'\\end{flushright}'+eol);
				});
				$('div.state, div.quote', el).each(function(sidx) {
					$(this).html('\\begin{quote}'+eol+$(this).html()+'\\end{quote}'+eol);
				});
				$('div.song', el).each(function(sidx) {
					$(this).html('\\begin{quotation}'+eol+$(this).html()+'\\end{quotation}'+eol);
				});
				let $el, $next, $idx, tries, cols, par_width_cur;
				$('canvas', el).each(function (cidx) {			// this will parse canvases but canvas images should be saved manually with a filename id.png where id is the value of canvas id attribute
					if (!($(this).hasAttribute('id'))) return;	// continue
					$('<a><img src="'+root.latex.canvas_image_path+$(this).attr('id')+'.png"'+($(this).hasAttribute('latex-width')?' latex-width="'+$(this).attr('latex-width')+'"':'')+'></a>').insertBefore($(this));
					$(this).remove();
				});
				$('div.img', el).each(function (iidx) {
					$next = $(this).next();
					$idx = '';
					$idx = $(this).prevAll('[idx]').last().attr('idx');
					$el = $(this);
					tries = 3;
					while (typeof($idx) == 'undefined' && tries-- > 0) {
						$el = $el.parent();
						$idx = $el.prevAll('[idx]').last().attr('idx');
					}
					if (typeof($idx) == 'undefined') $idx = '';
					tmpstr2 = '';
					if ($next.hasClass('imgsub')) {
						tmpstr2 = $next.text().replace(/^Fig(ure|\.)\s*([0-9]+):\s*.*$/, '$2');
					}
					tmpstr = eol+'\\renewcommand{\\thefigure}{'+tmpstr2+'}'+eol;
					tmpstr += eol+'\\begin{figure}[!htbp]'+eol+'\\centering'+eol;
					let par_width = 1 / $('a', $(this)).length;
					$('a', $(this)).each(function (idx2) {
						par_width_cur = ($('img', $(this)).hasAttribute('latex-width')?$('img', $(this)).attr('latex-width'):par_width).toString();
						if (par_width_cur.match(/^[0-9\.]+$/) !== false)
							par_width_cur += '\\textwidth';
						//tmpstr += '\\parbox{'+par_width_cur+'} {%';
						tmpstr += (idx2>0?'~'+eol:'')+'	\\begin{subfigure}[t]{'+par_width_cur+'}'+eol;
						//tmpstr += '	\\begin{figure}[t]{'+par_width_cur+'}'+eol;
						tmpstr += '		\\centering'+eol;
						//tmpstr += '		\\includegraphics[width='+par_width_cur+']{'+$(this).attr('href')+'}'+eol;	// generally, high def src (not used as may contain all subfigures)
						tmpstr += '		\\includegraphics[width=\\textwidth]{'+$('img', $(this)).attr('src').replace(/^\//, '')+'}'+eol;
						tmpstr += '	\\end{subfigure}%'+eol;
						//tmpstr += '	\\end{figure}'+eol;
						//tmpstr += '}%'+eol;
					});
					if ($next.hasClass('imgsub')) {
						$next.html($next.html().latexize());
						tmpstr += '\\caption{'+$next.text().replace(/^Fig(ure|\.)\s*[0-9]+:\s*(.*)$/, '$2')+'}';
						if ($idx != '')
							tmpstr += '\\label{'+$idx+'}';
						//$next.html($next.html()+eol);
						$next.remove();
					}
					tmpstr += '\\end{figure}'+eol;
					$(this).html(tmpstr);
				});
				$('div[timerel]', el).each(function(tidx) {
					$(this).html($(this).html().replace(/\\(begin|end)\{subfigure\}[^\r\n]*[\r\n]+/g, '').replace(/\\centering[^\r\n]*[\r\n]+/g, '').replace(/\\caption\{/g, '\\captionof{figure}{'));
					$(this).html($(this).html().replace(/\\(begin|end)\{figure\}[^\r\n]*[\r\n]+/g, '\\$1{center}'+eol));
					if (root.latex.usecolorbox > 0)
						$(this).html(eol+'\\vspace{'+root.latex.vspace+'}\\noindent\\setlength{\\fboxsep}{6pt}\\begin{tcolorbox}[breakable, enhanced]'+eol+$(this).html()+eol+'\\end{tcolorbox}\\vspace{'+root.latex.vspace+'}'+eol);
					else
						$(this).html(eol+'\\vspace{'+root.latex.vspace+'}\\noindent\\setlength{\\fboxsep}{6pt}\\fbox {%'+eol+'	\\parbox{\\textwidth} {%'+eol+$(this).html()+eol+'	}%'+eol+'}\\vspace{'+root.latex.vspace+'}'+eol);
				});
				$('table', el).each(function(tidx) {
					let widths = [];
					$next = $(this).next();
					cols = $('th', $(this)).length;
					if (cols < 1) {
						cols = $('tr:first-of-type > td', $(this)).length;
						$('tr:first-of-type > td', $(this)).each(function (tidx2) {
							par_width_cur = ($(this).hasAttribute('latex-width')?$(this).attr('latex-width'):'').toString();
							if (par_width_cur.match(/^[0-9\.]+$/) !== false)
								par_width_cur += '\\textwidth';
							widths[tidx2] = par_width_cur;
						});
					}
					else {
						$('th', $(this)).each(function (tidx2) {
							par_width_cur = ($(this).hasAttribute('latex-width')?$(this).attr('latex-width'):'').toString();
							if (par_width_cur.match(/^[0-9\.]+$/))
								par_width_cur += '\\textwidth';
							widths[tidx2] = par_width_cur;
						});
					}
					$('th, td', $(this)).each(function (tidx2) {
						if ($(this).html().indexOf('$') < 0)
							$(this).html($(this).html().replace(/\\[\s]/g, '\\textbackslash ').replace(/\&nbsp\;/g, ' ').replace(/\&amp\;/g, '&').replace(/^([\&\%\#\{\}])/g, '\\$1').replace(/([^\\])([\&\%\#\{\}])/g, '$1\\$2'));
						if ($(this).parent().hasAttribute('class') && (tmparr = $(this).parent().attr('class').match(/\bn([1-5])\b/)))
							$(this).html('\\textcolor{n'+tmparr[1]+'}{'+$(this).html()+'}');
						if ($(this).prop('tagName') == 'TD' && $(this).html().match(/<br[^>]+noformat[^>]*>/))
							$(this).html('\\makecell[tl]{'+$(this).html().replace(/<br[^>]+noformat[^>]*>/g, '\\\\ ')+'}');
						$(this).html($(this).html()+' & ');
					});
					$('tr', $(this)).each(function(tidx2) {
						if (typeof($('th:last-of-type', $(this)).html()) != 'undefined')
							$('th:last-of-type', $(this)).html($('th:last-of-type', $(this)).html().replace(' &amp; ', ' \\\\'));
						if (typeof($('td:last-of-type', $(this)).html()) != 'undefined')
							$('td:last-of-type', $(this)).html($('td:last-of-type', $(this)).html().replace(' &amp; ', ' \\\\'));
						if (typeof($('th:last-of-type', $(this)).html()) != 'undefined')
							$('th:last-of-type', $(this)).html($('th:last-of-type', $(this)).html()+' \\hline \\tstrut');
						if (typeof($('th:last-of-type, td:last-of-type', $(this)).html()) != 'undefined')
							$('th:last-of-type, td:last-of-type', $(this)).html($('th:last-of-type, td:last-of-type', $(this)).html()+eol);
					});
					tmpstr = '';
					if ($next.hasClass('imgsub')) {
						$next.html($next.html().latexize());
						tmpstr = '\\caption{'+$next.text().replace(/^Table\.?\s*[0-9]+:\s*(.*)$/, '$1')+'}'+eol;
						tmpstr2 = $next.text().replace(/^Table\.?\s*([0-9]+):\s*.*$/, '$1');
						if (tmpstr2.match(/^[0-9]+$/))
							tmpstr += '\\label{'+tmpstr2+'}'+eol;
						//$next.html($next.html()+eol);
						$next.remove();
					}
					tmpstr2 = ' '+(widths[0]!=''?'p{'+widths[0]+'} ':'l ');
					tmpvar = cols;
					while (--cols) tmpstr2 += '| '+(widths[tmpvar-cols]!=''?'p{'+widths[tmpvar-cols]+'}':(cols==1?'r':'c'))+' ';
					/*  tmpstr += '% parent = '+$(this).parent().prop("tagName");
					  $.each($(this).parent()[0].attributes, function() {
						// this.attributes is not a plain object, but an array
						// of attribute nodes, which contain both the name and value
						if(this.specified) {
						  //console.log(this.name, this.value);
						  tmpstr += ' '+this.name+'='+this.value;
						}
					  });
					  tmpstr += eol;*/
					tmpstr3 = ''; tmpstr4 = '';
					// standard font sizes: \tiny, \scriptsize, \footnotesize, \small, \normalsize, \large, \Large, \LARGE, \huge, \Huge
					if ($(this).hasClass('small')) {
						tmpstr3 = eol+'\\scriptsize{';
						tmpstr4 = '}';
					}
					if ($(this).hasAttribute('latex-fontsize') && $(this).attr('latex-fontsize').length > 0) {
						tmpstr3 = eol+'\\'+$(this).attr('latex-fontsize').replace(/^\\/, '')+'{';
						tmpstr4 = '}';
					}
					if ($(this).parent().hasAttribute('timerel') || $(this).parent().parent().hasAttribute('timerel')) {
					//if (typeof($(this).parent().attr('timerel')) != typeof undefined) {
						tmpstr = tmpstr.replace(/\\caption\{/g, '\\captionof{table}{');
						$('<div></div>').insertBefore($(this)).html(tmpstr3+'\\begin{tabular}[h]{'+tmpstr2+'}'+eol+'\\centering'+eol);
						$('<div></div>').insertAfter($(this)).html(eol+'\\end{tabular}'+tmpstr4+tmpstr+eol);
					}
					else {
						//$(this).html(eol+'\\begin{table}[h]'+eol+'\\begin{tabular}{'+tmpstr2+'}'+eol+$(this).html()+eol+'\\end{tabular}'+eol+tmpstr+'\\end{table}'+eol);
						$('<div></div>').insertBefore($(this)).html(eol+'\\begin{table}[h!]'+eol+'\\centering'+tmpstr3+'\\begin{tabular}{'+tmpstr2+'}'+eol);
						$('<div></div>').insertAfter($(this)).html(eol+'\\end{tabular}'+tmpstr4+tmpstr+'\\end{table}'+eol);
					}
				});
				$('span.neutral', el).each(function (sidx) {
					 $(this).html('\\textcolor{OliveGreen}{'+$(this).html()+'}');
				});
				$('a.reflink', el).each(function(aidx) {
					if (!$(this).hasAttribute('id')) return;	// continue
					tmparr = $(this).attr('id').match(/^ref([0-9]+)$/);
					if (tmparr !== null && typeof(tmparr[1]) != 'undefined') {
						$(this).html('\\cite{'+tmparr[1]+'}');
					}
				});
				$('.noshow, div.update', el).remove();
				el.latexEl();
				el.html(el.html().replace(/<br[^>]+noformat[^>]*>/g, '\\\\'+eol).replace(/\<br[^\>]*\>/g, eol).latexize(false));
				tex += el.text().niceLatex(eol).trim()+eol;
			});
			if (this.buildrefs > 0) {
				tex += eol+'\\let\\doi\\relax'+eol;
				tex += eol+'\\begin{thebibliography}{'+this.refs.length+'}'+eol;
				$(this.refs).each(function (ridx) {
					tex += eol+'\\bibitem{'+this.id+'}'+eol;
					tex += this.item.latexize().niceLatex(eol).replace('%', '\\%')+'\\\\'+eol;
					if (this.url != '') tex += '\\doi{'+this.url.replace(/([_#%&])/g, '\\$1')+'}'+eol;
				});
				tex += eol+'\\end{thebibliography}'+eol;
			}
			tex += eol+'\\end{document}';
			this.download(filename, tex);
		}
	},
	updates: {
		first_visit: true,
		check: function() {
			fetch('/check.php')
			.then(
				function(response) {
					if (response.status != 200) {
						console.warn('UPDATES.CHECK.fetch() ERROR: '+response.status);
						return;
					}
					response.text().then(function (data) {
						var tmp2 = data.split("\n");
						var files = {}, files_local = {}, hash, tmp;
						var files_new = [], files_updated = [];
						tmp = root.getLocal('files', 'root.updates');
						if (typeof(tmp) != 'undefined' && tmp !== null) {
							root.updates.first_visit = false;
							files_local = JSON.parse(tmp);
						}
						$(tmp2).each(function (idx) {
							tmp = this.match(/^(.+)\s([^\s]+)\r?$/);
							if (tmp === null) return;
							hash = tmp[1].hashCode();							
							files[hash] = {};
							files[hash].name = tmp[1];
							files[hash].crc32 = tmp[2];
							if (typeof(files_local[hash]) == 'undefined') files_new.push(tmp[1]);
							else if (files_local[hash].crc32 != tmp[2]) files_updated.push(tmp[1]);
						});
						//console.log(files);return false;
						root.storeLocal('files', JSON.stringify(files), 'root.updates');
						if (root.updates.first_visit) return false;
						if (files_new.length == 0 && files_updated.length == 0) {
							root.cmd.say('No updates.');
							return false;
						}
						tmp = '';
						var files_new_cnt = files_new.length, files_updated_cnt = files_updated.length;
						$(files_new).each(function (idx) {
							if (this.match(/^\/blog\/.*(\.html?|index\.php)$/)) {
								--files_new_cnt;
								++files_updated_cnt;
								files_updated.push(this);
								return;	// continue
							}
							tmp2 = (this.match(/(\.html?|index\.php)$/)?'<a href="'+(this.match(/^\/blog\//)?'/blog/index.php':this)+'" class="local" noref="1">'+this+'</a>':this);
							tmp += tmp2 + ' (<span class="neutral">NEW</span>)<br>';
						});
						var files_updated_unique = [];
						$(files_updated).each(function (idx) {
							tmp2 = this.replace(/\.header\.inc\.php$/, '.php');
							tmp2 = tmp2.replace(/\/answers\/answers\.txt/, '/answers/index.php');
							if (tmp2 == '/main.js') tmp2 = 'MATERRA OS ['+tmp2+']';
							tmp2 = (tmp2.match(/(\.html?|index\.php)$/)?'<a href="'+(tmp2.match(/^\/blog\//)?'/blog/index.php':tmp2)+'" class="local" noref="1">'+tmp2+'</a>':tmp2);
							if ($.inArray(tmp2, files_updated_unique) > -1) {
								--files_updated_cnt;
								return;	// continue
							}
							files_updated_unique.push(tmp2);
							tmp += tmp2 + ' (<span true>UPDATED</span>)<br>';
						});
						tmp = 'There are '+(files_new_cnt>0?'<span class="neutral">'+files_new_cnt+'</span> new file(s)':'')+(files_updated_cnt>0?(files_new_cnt>0?' and ':'')+'<span true>'+files_updated_cnt+'</span> update(s)':'')+':<br><br>'+tmp;
						root.cmd.cmds.div.exec('<br>'+tmp+'<br>');
						if (root.cmd.local.separator.val) root.cmd.cmds.hr.exec();
						return true;
					});
				}
			)
			.catch(function(err) {
				console.error('UPDATES.CHECK.fetch() NETWORK ERROR: '+err);
			});
		},
		chlog: function() {
			fetch('/CHANGE_LOG.TXT')
			.then(
				function(response) {
					if (response.status != 200) {
						console.warn('UPDATES.CHLOG.fetch() ERROR: '+response.status);
						return;
					}
					response.text().then(function (data) {
						root.cmd.cmds.div.exec('MATERRA Change log:<br><br>'+data.htmlentities().replace(/\t/g, "<br>\t").HTMLize().replace(/\<br\>([0-9]+\.[0-9]+\.[0-9]+)/g, '<br><br><br>$1').replace(/([0-9]+\.[0-9]+\.[0-9]+)/g, '<span true><b>$1</b></span>').replace(/&quot;(.+?)&quot;/g, '<em>$1</em>').replace(/&lt;(.+?)&gt;/g, '<b>$1</b>').replace(/%ARCHIVE_LINK%/, '<br><span true>... <a href="/CHANGE_LOG_ARCHIVE.TXT" style="text-decoration: none"><span true>ARCHIVED LOG</span></a> ...</span><br>')+'<br>');
						if (root.cmd.local.separator.val) root.cmd.cmds.hr.exec();
						return true;
					});
				}
			)
			.catch(function(err) {
				console.error('UPDATES.CHLOG.fetch() NETWORK ERROR: '+err);
			});
		}
	},
	memory: {	// used to conserve memory context between page loads
		expander_main_states: {},	// stores text block expander states (main)
		expander_states: {},		// stores text block expander states
		summaries: {},				// stores summaries and definitions (used in def/explain)
		quotes: {},					// stores global quotes
		pages: {},					// links hash with location, stores other data such as title (perhaps the above objects should also be placed here)
		get_main_hash: function() {
			return location.href.replace(/[#\?].*$/, '').hashCode();
		},
		load_pages_from_storage: function() {
			tmp = root.getLocal('pages', 'root.memory');
			if (typeof(tmp) != 'undefined' && tmp !== null) this.pages = JSON.parse(tmp);
		},
		save_pages_to_storage: function() {
			if (this.pages !== null)
				root.storeLocal('pages', JSON.stringify(this.pages), 'root.memory');
		},
		save_pages: function() {
			this.pages[this.get_main_hash()] = { title: (typeof($('body .main_head > h1').html()) != 'undefined'?$('body .main_head > h1').html().stripTags(2):''), location: location.href.replace(/#.*$/, '') };
			this.save_pages_to_storage();
		},
		clear: function(hard = true) {
			if (hard) {
				root.removeLocal('expander_main_states', 'root.memory');
				root.removeLocal('expander_states', 'root.memory');
				root.removeLocal('summaries', 'root.memory');
				root.removeLocal('pages', 'root.memory');
			}
			this.expander_main_states = {};
			this.expander_states = {};
			this.summaries = {};
			this.pages = {};
		},
		load_summaries_from_storage: function() {
			tmp = root.getLocal('summaries', 'root.memory');
			if (typeof(tmp) != 'undefined' && tmp !== null) this.summaries = JSON.parse(tmp);
		},
		save_summaries_to_storage: function() {
			if (this.summaries !== null)
				root.storeLocal('summaries', JSON.stringify(this.summaries), 'root.memory');
		},
		save_summary: function() {
			var hash = this.get_main_hash();
			this.summaries[hash] = $.map(root.summary.entities, function(obj) {
				return $.extend(true, {}, obj);
			});
			/*console.log('STORED_SUMMARY:');
			console.log(this.summaries[hash]);*/
			this.save_summaries_to_storage();
		},
		load_quotes_from_storage: function() {
			tmp = root.getLocal('quotes', 'root.memory');
			if (typeof(tmp) != 'undefined' && tmp !== null) this.quotes = JSON.parse(tmp);
		},
		save_quotes_to_storage: function() {
			if (this.quotes !== null)
				root.storeLocal('quotes', JSON.stringify(this.quotes), 'root.memory');
		},
		save_quotes: function(quotes) {
			var hash = this.get_main_hash();
			this.quotes[hash] = quotes;
			this.save_quotes_to_storage();
		},
		load_expander_states_from_storage: function() {
			let tmp = root.getLocal('expander_main_states', 'root.memory');
			if (typeof(tmp) != 'undefined' && tmp !== null) this.expander_main_states = JSON.parse(tmp);
			tmp = root.getLocal('expander_states', 'root.memory');
			if (typeof(tmp) != 'undefined' && tmp !== null) this.expander_states = JSON.parse(tmp);
		},
		save_expander_states_to_storage: function() {
			if (this.expander_main_states !== null)
				root.storeLocal('expander_main_states', JSON.stringify(this.expander_main_states), 'root.memory');
			if (this.expander_states !== null)
				root.storeLocal('expander_states', JSON.stringify(this.expander_states), 'root.memory');
		},
		load_expander_states: function() {
			var hash = this.get_main_hash();
			var $this = this;
			if (this.expander_main_states !== null && typeof(this.expander_main_states[hash]) != 'undefined' && typeof($('body div.expander_main').attr('state')) != 'undefined')
				if ($('body div.expander_main').attr('state') != this.expander_main_states[hash]) $('body div.expander_main').trigger('click');
			if (this.expander_states === null || typeof(this.expander_states[hash]) == 'undefined') return;
			$('body div.expander[idx]').each(function (index) {
				if (typeof($this.expander_states[hash][$(this).attr('idx').hashCode()]) != 'undefined' && $this.expander_states[hash][$(this).attr('idx').hashCode()] != $(this).attr('state'))
					$(this).trigger('click');
			});
		},
		save_expander_states: function() {
			var hash = this.get_main_hash();
			var $this = this;
			console.log('HASH FOR '+location.href+': '+hash);
			this.expander_states[hash] = {};
			if (typeof($('body div.expander_main').attr('state')) != 'undefined')
				this.expander_main_states[hash] = $('body div.expander_main').attr('state');
			$('body div.expander[idx]').each(function (index) {
				$this.expander_states[hash][$(this).attr('idx').hashCode()] = $(this).attr('state');
			});
			this.save_expander_states_to_storage();
		}
	},
	webpages: {
		//remote: {},	// do we need 'em in memory
		local: {},
		is_local: false,
		local_title: '',
		local_hash: '',
		calc_pos_hashes: function() {
			var h1 = '', h2 = '', h3 = '', h4 = '', h_el, tmp, last_pos_hash = '';
			$('body .spirit').each(function (idx) {
				h_el = $(this).children('h1,h2,h3,h4,h5').first();
				if (typeof(h_el.prop("tagName")) == 'undefined') return;	// continue
				tmp = h_el.prop("tagName").toLowerCase();
				//if (!tmp.match(/^h[0-9]$/)) return;
				if (!h_el.hasAttribute('hash'))
					h_el.attr('hash', h_el.html().stripTags(2).toLowerCase().hashCode());
				switch (tmp) {
					case 'h1':
						h1 = h_el.attr('hash');
						$(this).attr('pos-hash', h1);
						break;
					case 'h2':
						h2 = h_el.attr('hash');
						$(this).attr('pos-hash', h1+'-'+h2);
						break;
					case 'h3':
						h3 = h_el.attr('hash');
						$(this).attr('pos-hash', h1+'-'+h2+'-'+h3);
						break;
					case 'h4':
						h4 = h_el.attr('hash');
						$(this).attr('pos-hash', h1+'-'+h2+'-'+h3+'-'+h4);
						break;
					default:
						$(this).attr('pos-hash', h1+'-'+h2+'-'+h3+'-'+h4+'-'+h_el.attr('hash'));
				}
				$(this).attr('prev-pos-hash', last_pos_hash);
				last_pos_hash = $(this).attr('pos-hash');
			});
		},
		set_local_true: function(title) {
			this.is_local = true;
			this.local_title = title;
			this.local_hash = title.stripTags(2).toLowerCase().hashCode();
		},
		set_local_false: function() {
			this.is_local = false;
			this.local_title = '';
			this.local_hash = '';
		},
		enum_local: function() {
			var tmp = root.getLocal('local', 'root.webpages');
			if (typeof(tmp) != 'undefined' && tmp !== null)
				this.local = JSON.parse(tmp);
		},
		upload: function(key) {
			if (!this.is_local) {
				root.cmd.say('This only works on local webpages.');
				return false;
			}
			root.unbuildReferences();
			body = $('body').clone();
			$('table.head', body).remove();
			$('div.spirit.references, div.expander, div.expander_main, div.footer, div.toolbar, div.spirit_actions, div#MathJax_Message', body).remove();
			$('div.spirit', body).removeClass('local');
			$('div.spirit, h1, h2, h3, h4', body).each(function (idx) {
				$(this).removeAttr('hash');
				$(this).removeAttr('idx');
				$(this).removeAttr('data-idx');
				$(this).removeAttr('data-old-hash');
				$(this).removeAttr('data-pre');
				$(this).removeAttr('pos-hash');
				$(this).removeAttr('prev-pos-hash');
			});
			$('div.spirit', body).each(function (idx) {
				$(this).removeClass('editable');
				$(this).removeAttr('data-edit-event');
				$(this).removeAttr('orig-text');
				jQuery.fn.removeTypeset(this);
				$(this).removeTypesetAlt();
				$(this).html($(this).html().replace(/\<script type="math\/tex" id="[^"]*"\>([\s\S]*?)\<\/script\>/g, '$$$1$$'));
				root.unclearPast($('div[timerel]', $(this)));
				$('h2,h3,h4', $(this)).each(function (idx) {
					$(this).html($(this).html().replace(/^\<span\>[0-9\.]+\<\/span\>\s+/, ''));
				});
				//$(this).untransformSpirit();
			});
			url = '/uploads/upload.php';
			let post_data = { html: body.html().replaceAll('<!-- SP_ACTIONS --><!-- /SP_ACTIONS -->', ''), title: this.local_title, key: key };
			var fd = new FormData();
			for (var x in post_data)
				fd.append(x, post_data[x]);
			root.buildReferences();
			fetch(url, {
				method: 'POST',
				/*headers: {
					'Content-Type': 'multipart/form'
				},*/
				body: fd
			})
			.then(
				function(response) {					
					if (response.status != 200) {
						console.warn('UPLOAD.fetch() ERROR: '+response.status);
						if (response.status == 404)
							root.cmd.say('Webpage "'+url+'" not found.'+"\n");
						else
							root.cmd.say('UPLOAD() ERROR: '+response.status+"\n");
						return;
					}
					console.log('UPLOAD OK!');
					console.log(response);
					response.text().then(function (data) {
						console.log(data);
						switch (data) {
							case '-1':
								root.cmd.say('Uploads are disabled.');
								break;
							case '0':
								root.cmd.say('Upload failed.');
								break;
							case '1':
								root.cmd.say('Done.');
								break;
							default:
								root.cmd.say('Unexpected return.');
						}
					});
				}
			)
			.catch(function(err) {
				console.error('UPLOAD.fetch() NETWORK ERROR (url='+url+'): '+err);
				root.cmd.say('UPLOAD() NETWORK ERROR: '+err+"\n");
			});
		},
		rename_local: function(old, title) {
			let old_hash = old.stripTags(2).toLowerCase().hashCode();
			let new_hash = title.stripTags(2).toLowerCase().hashCode();
			if (typeof this.local[old_hash] != 'undefined') delete this.local[old_hash];
			else return false;
			let tmp = root.getLocal('local_'+old_hash, 'root.webpages');
			tmp = tmp.replace(/(\<h1[^\>]*\>).*?\<\/h1\>/, '$1'+title+'</h1>');
			root.removeLocal('local_'+old_hash, 'root.webpages');
			root.storeLocal('local_'+new_hash, tmp, 'root.webpages');
			this.local[new_hash] = title;
			root.storeLocal('local', JSON.stringify(this.local), 'root.webpages');
			root.menu.update();
			if (this.is_local && this.local_hash == old_hash) {
				this.set_local_true(title);
				$('body .spirit.main_head > h1').html(title);
			}
			return true;
		},
		create_local: function(title) {	// creates new webpage
			this.set_local_true(title);
			this.local[this.local_hash] = this.local_title;
			let tmp = root.getLocal('local_'+this.local_hash, 'root.webpages');
			if (typeof(tmp) == 'undefined' || tmp === null) {
				root.storeLocal('local_'+this.local_hash, JSON.stringify([]), 'root.webpages');
				root.storeLocal('local', JSON.stringify(this.local), 'root.webpages');
			}
			root.load('local:'+title);
		},
		save_local: function() {	// stores local webpage
			this.calc_pos_hashes();
			var spirits = [], tmp;
			root.unbuildReferences();
			$('body .spirit').each(function (idx) {
				if ($(this).hasClass('references')) return;
				tmp = $(this).clone();
				tmp.removeClass('editable');
				tmp.removeAttr('data-edit-event');
				tmp.removeAttr('orig-text');
				$('div.expander, div.expander_main, div#MathJax_Message', tmp).remove();
				jQuery.fn.removeTypeset(tmp[0]);
				tmp.removeTypesetAlt();
				tmp.html(tmp.html().replace(/\<script type="math\/tex" id="[^"]*"\>([\s\S]*?)\<\/script\>/g, '$$$1$$'));
				root.unclearPast($('div[timerel]', tmp));
				$('h2,h3,h4', tmp).each(function (idx) {
					$(this).html($(this).html().replace(/^\<span\>[0-9\.]+\<\/span\>\s+/, ''));
				});
				//$(this).untransformSpirit();
				spirits.push(tmp.prop('outerHTML'));
			});
			if (spirits.length > 0) {
				root.storeLocal('local_'+this.local_hash, JSON.stringify(spirits), 'root.webpages');
				this.local[this.local_hash] = this.local_title;
				root.storeLocal('local', JSON.stringify(this.local), 'root.webpages');
			}
			else {
				root.removeLocal('local_'+this.local_hash, 'root.webpages');
				delete this.local[this.local_hash];
				if (!$.isEmptyObject(this.local))
					root.storeLocal('local', JSON.stringify(this.local), 'root.webpages');
				else
					root.removeLocal('local', 'root.webpages');
			}
			root.buildReferences();
			root.menu.update();
		},
		remove_local: function(title) {
			let hash = title.stripTags(2).toLowerCase().hashCode();
			root.removeLocal('local_'+hash, 'root.webpages');
			if (typeof(this.local[hash]) != 'undefined') {
				delete this.local[hash];
				if (!$.isEmptyObject(this.local))
					root.storeLocal('local', JSON.stringify(this.local), 'root.webpages');
				else
					root.removeLocal('local', 'root.webpages');
			}
			/*if (this.is_local && hash == this.local_hash) {	// if it's the current page
			}*/
			root.menu.update();
		},
		load_local: function(title) {
			let spirits = [];
			var el, el_prev, prev_pos_hash, i;
			var tmp = root.getLocal('local_'+title.stripTags(2).toLowerCase().hashCode(), 'root.webpages');
			if (typeof(tmp) != 'undefined' && tmp !== null) {
				this.set_local_true(title);
				//this.calc_pos_hashes();
				$('body').removeClass().html('');
				spirits = JSON.parse(tmp);
				$(spirits).each(function (idx) {
					el = $(this.toString());
					//console.log(el);
					prev_pos_hash = el.attr('prev-pos-hash');
					el_prev = $('body .spirit[pos-hash="'+prev_pos_hash+'"]');
					while (typeof el_prev.html() == 'undefined' && prev_pos_hash.indexOf('-') > 0) {
						tmp = prev_pos_hash.split('-');
						prev_pos_hash = '';
						for (i=0; i<tmp.length-1; i++) {
							prev_pos_hash += (prev_pos_hash.length>0?'-':'')+tmp[i];
						}
						el_prev = $('body .spirit[pos-hash="'+prev_pos_hash+'"]');
					}
					if (typeof el_prev.html() == 'undefined') {
						if (typeof $('body > .footer').html() != 'undefined') $('body > .footer').before(el);
						else $('body').append(el);
					}
					else {
						if (typeof el_prev.next('div.spirit_actions').html() != 'undefined')
							el_prev = el_prev.next('div.spirit_actions');
						el.insertAfter(el_prev);
					}
				});
				return true;
			}
			return false;
		},
		save_remote: function() {		// stores spirits (.local) added to remote pages
			if (this.is_local) return this.save_local();
			this.calc_pos_hashes();
			var main_hash = root.memory.get_main_hash(), spirits = [], tmp;
			//this.remote[main_hash] = { spirits: [] };
			//var $this = this.remote[main_hash];
			$('body .spirit.local').each(function (idx) {
				//$this.spirits.push($(this).prop('outerHTML'));
				tmp = $(this).clone();
				tmp.removeClass('editable');
				tmp.removeAttr('data-edit-event');
				tmp.removeAttr('orig-text');
				spirits.push(tmp.prop('outerHTML'));
			});
			if (spirits.length > 0)
				root.storeLocal('remote_'+main_hash, JSON.stringify(spirits), 'root.webpages');
			else
				root.removeLocal('remote_'+main_hash, 'root.webpages');
		},
		load_remote: function() {
			let spirits = [];
			var el, el_prev, prev_pos_hash, i;
			var tmp = root.getLocal('remote_'+root.memory.get_main_hash(), 'root.webpages');
			if (typeof(tmp) != 'undefined' && tmp !== null) {
				this.calc_pos_hashes();
				spirits = JSON.parse(tmp);
				$(spirits).each(function (idx) {
					el = $(this.toString());
					//console.log(el);
					prev_pos_hash = el.attr('prev-pos-hash');
					el_prev = $('body .spirit[pos-hash="'+prev_pos_hash+'"]');
					while (typeof el_prev.html() == 'undefined' && prev_pos_hash.indexOf('-') > 0) {
						tmp = prev_pos_hash.split('-');
						prev_pos_hash = '';
						for (i=0; i<tmp.length-1; i++) {
							prev_pos_hash += (prev_pos_hash.length>0?'-':'')+tmp[i];
						}
						el_prev = $('body .spirit[pos-hash="'+prev_pos_hash+'"]');
					}
					if (typeof el_prev.html() == 'undefined') {
						if (typeof $('body > .footer').html() != 'undefined') $('body > .footer').before(el);
						else $('body').append(el);
					}
					else {
						if (typeof el_prev.next('div.spirit_actions').html() != 'undefined')
							el_prev = el_prev.next('div.spirit_actions');
						el.insertAfter(el_prev);
					}
				});
			}
		}
	},
	plugins: {
		plugins: {},
		initialized: false,
		load_all_tries: 0,
		get_plugin_idx_by_key: function(key) {
			var idx = false;
			$(Object.keys(this.plugins)).each(function (index) {
				if (root.plugins.plugins[this].key == key) {
					idx = this;
					return false;
				}
			});
			return idx;
		},
		load: function(idx, reload = false) {
			//root.cmd.say('Loading plugin '+root.plugins.plugins[idx].title+' '+root.plugins.plugins[idx].version+'...');
			$.ajax({
				url: '/plugins/'+root.plugins.plugins[idx].url,
				dataType: 'script',
				cache: !reload
			}).done(function() {
				root.plugins.plugins[idx].loaded = true;
				//root.cmd.say('Plugin '+root.plugins.plugins[idx].title+' '+root.plugins.plugins[idx].version+' loaded.');
				if (reload) root.cmd.say('Plugin '+root.plugins.plugins[idx].title+' '+root.plugins.plugins[idx].version+' loaded.');
			}).fail(function (xhr, status, error) {
				root.cmd.say('Network error encountered, plugin '+root.plugins.plugins[idx].title+' '+root.plugins.plugins[idx].version+' not loaded.');
				console.error('PLUGINS.LOAD.ajax() ERROR '+xhr.status+': '+xhr.statusText);
			});
		},
		load_all: function() {
			if (!root.plugins.initialized) {
				setTimeout(root.plugins.load_all, ++root.plugins.load_all_tries*300);
				return;
			}
			var i = 0;
			$(Object.keys(root.plugins.plugins)).each(function (idx) {
				if (root.plugins.plugins[this].autodisabled) return;	// continue
				++i;
				root.plugins.load(this);
			});
			if (i > 0) root.cmd.say('Loaded '+i+' plugin(s).');
		},
		disable: function(idx) {
			this.plugins[idx].autodisabled = true;
			root.storeLocal('autodisabled_'+this.plugins[idx].key, JSON.stringify(true), 'root.plugins');
		},
		enable: function(idx) {
			this.plugins[idx].autodisabled = false;
			root.removeLocal('autodisabled_'+this.plugins[idx].key, 'root.plugins');
		},
		canDisable: function(idx) {
			return this.plugins[idx].candisable;
		},
		isLoaded: function(idx) {
			return this.plugins[idx].loaded;
		},
		init: function() {
			fetch('/plugins/index.php')
			.then(
				function(response) {
					if (response.status != 200) {
						console.warn('PLUGINS.INIT.fetch() ERROR: '+response.status);
						return;
					}
					root.plugins.plugins = {};
					response.json().then(function (data) {
						$(data.plugins).each(function (idx) {
							if (typeof(this.url) == 'undefined' || this.url == '') return;
							root.plugins.plugins[idx] = $.extend({'title': '', 'version': '', 'desc': '', 'author' : '', 'website': '', 'contributions': '', 'candisable': 'yes'}, this);
							root.plugins.plugins[idx].candisable = (root.plugins.plugins[idx].candisable.match(/(yes|true|1)/)?true:false);
							root.plugins.plugins[idx].key = this.url.hashCode();
							root.plugins.plugins[idx].loaded = false;
							root.plugins.plugins[idx].autodisabled = (root.getLocal('autodisabled_'+root.plugins.plugins[idx].key, 'root.plugins')?true:false);
						});
						root.plugins.initialized = true;
					});
					//console.log(root.plugins.plugins);
				}
			)
			.catch(function(err) {
				console.error('PLUGINS.INIT.fetch() NETWORK ERROR: '+err);
			});
		}
	},
	menu : {
		items: {},
		activate: function(item) {
			$('html > div.menu > ul > li > a').removeClass('active');
			item = item.replace(/^.*\:\/\/[^\/]*/, '');
			console.log('MENU_ITEM='+item);
			if (item.indexOf('/') >= 0) {
				item = item.replace(/^.*?([^\/]*\/[^\/]*\/)[^\/]*$/, '$1');
				$('html > div.menu > ul > li > a').each(function (idx) {
					if ((item.length > 1 && $(this).hasAttribute('href') && $(this).attr('href').indexOf(item) == 0) || ($(this).hasAttribute('href') && $(this).attr('href') == item) || ($(this).hasAttribute('alturl') && $(this).attr('alturl') == item)) $(this).addClass('active');
				});
			}
			else 
				$('html > div.menu > ul > li > a[href="'+encodeURI(item)+'"]').addClass('active');
		},
		adjust: function() {
			// to be run on resize
		},
		getItemURL: function(item) {
			let tmp = item.toLowerCase().hashCode();
			if (typeof(this.items[tmp]) != 'undefined') return this.items[tmp];
			return null;
		},
		removeLocal: function() {	// removes local pages from items
			var tmp = []
			$(Object.keys(this.items)).each(function (idx) {
				if (root.menu.items[this].indexOf('local:') == 0) tmp.push(this);
			});
			for (item of tmp)
				delete root.menu.items[item];
		},
		update: function() {
			var el = $('div.menu > ul');
			$('li.menuel.local', el).remove();
			if (!$.isEmptyObject(root.webpages.local)) {
				var mobile_el = $('div.menu > ul > li.toggler'), ael;
				var innerUl = $('<ul></ul>');
				this.removeLocal();
				$(Object.keys(root.webpages.local)).each(function (idx) {
					let tmp = root.webpages.local[this].toLowerCase().hashCode();
					if (typeof(root.menu.items[tmp]) == 'undefined')
						root.menu.items[tmp] = 'local:'+root.webpages.local[this];
					ael = $('<a href="local:'+root.webpages.local[this].htmlentities()+'" noref="1" ignore_build_local="1">'+root.webpages.local[this]+'</a>');
					ael.on('click', function(e) {
						if ((mobile_el).is(':visible'))
							$('div.menu > ul > li.menuel').toggle();
						e.preventDefault();
						root.load(this.href);
					});
					innerUl.append($('<li class="menuel"></li>').append(ael));
				});
				ael = $('<a href="" noref="1" ignore_build_local="1">Local</a>');
				ael.on('mouseenter', function(e) {
					$('div.menu > ul > li.menuel.local > ul').show();
				});
				let inMenu = $('<li class="menuel local"></li>');
				inMenu.on('mouseleave', function(e) {
					$('ul', $(this)).hide();
				});
				el.append(inMenu.append(ael).append(innerUl));
			}
		},
		init: function() {
			fetch('/menu.json')
			.then(
				function(response) {
					if (response.status != 200) {
						console.warn('MENU.INIT.fetch() ERROR: '+response.status);
						return;
					}
					response.json().then(function (data) {
						//console.log(data);
						$('html > div.menu').remove();
						var el = $('<ul></ul>'), ael;
						var mobile_el = $('<li class="toggler"><a noref="1" ignore_build_local="1">&#9776;</a></li>');
						mobile_el.on('click', function(e) {
							$('div.menu > ul > li.menuel').toggle();
						});
						el.append(mobile_el);
						root.menu.items = {};
						$(data.menuitem).each(function (idx) {
							//console.log(this);
							root.menu.items[this.title.toLowerCase().hashCode()] = this.url;
							ael = $('<a href="'+encodeURI(this.url)+'"'+(typeof(this.alturl) != 'undefined'?' alturl="'+encodeURI(this.alturl)+'"':'')+' noref="1" ignore_build_local="1">'+this.title+'</a>');
							el.append($('<li class="menuel'+((typeof(this.class) != 'undefined')?' '+this.class:'')+'"></li>').append(ael));
							if (this.url.indexOf('://') < 0 && this.url.indexOf('#') < 0) {
								ael.on('click', function(e) {
									if ((mobile_el).is(':visible'))
										$('div.menu > ul > li.menuel').toggle();
									e.preventDefault();
									root.load(this.href);
								});
							}
						});
						if (!$.isEmptyObject(root.webpages.local)) {
							console.log('LOCAL NOT EMPTY');
							var innerUl = $('<ul></ul>');
							$(Object.keys(root.webpages.local)).each(function (idx) {
								let tmp = root.webpages.local[this].toLowerCase().hashCode();
								if (typeof(root.menu.items[tmp]) == 'undefined')
									root.menu.items[tmp] = 'local:'+root.webpages.local[this];
								ael = $('<a href="local:'+root.webpages.local[this].htmlentities()+'" noref="1" ignore_build_local="1">'+root.webpages.local[this]+'</a>');
								ael.on('click', function(e) {
									if ((mobile_el).is(':visible'))
										$('div.menu > ul > li.menuel').toggle();
									e.preventDefault();
									root.load(this.href);
								});
								innerUl.append($('<li class="menuel"></li>').append(ael));
							});
							ael = $('<a href="" noref="1" ignore_build_local="1">Local</a>');
							ael.on('mouseenter', function(e) {
								$('div.menu > ul > li.menuel.local > ul').show();
							});
							let inMenu = $('<li class="menuel local"></li>');
							inMenu.on('mouseleave', function(e) {
								$('ul', $(this)).hide();
							});
							el.append(inMenu.append(ael).append(innerUl));
						}
						let el2 = $('<div class="menu"></div>');
						el2.append(el);
						//el2.insertAfter($('head'));
						el2.addClass('isOff');
						//el2.css('opacity', 0);
						el2.on('mouseenter', function(e) {
							//$(this).css('opacity', 0.96);
							$(this).removeClass('isOff');
							$(this).addClass('isOn');
						});
						el2.on('mouseleave', function(e) {
							//$(this).css('opacity', 0);
							$(this).removeClass('isOn');
							$(this).addClass('isOff');
						});
						$('html').prepend(el2);
						/*root.menu.activate(data.menuitem[0].url);*/
						root.menu.activate(location.href);
					});
				}
			)
			.catch(function(err) {
				console.error('MENU.INIT.fetch() NETWORK ERROR: '+err);
			});
		}
	},
	initCodeExpanders: function() {
		$('body div.code_expander').parent().next('pre').hide();
		$('body div.code_expander').on('click', function(e) {
			var pre_el = $(this).parent().next('pre');
			var code_el = $('> code', pre_el);
			var url = $(this).attr('data-src');
			if ($(this).attr('data-state') == '0') {
				pre_el.show();
				code_el.html('Loading...');
				$(this).attr('data-state', '1');
				$(this).html('-');
				fetch(url)
				.then(
					function(response) {					
						if (response.status != 200) {
							console.warn('initCodeExpanders.fetch() ERROR: '+response.status);
							if (response.status == 404)
								root.cmd.say('File "'+url+'" not found.'+"\n");
							else
								root.cmd.say('LOAD() ERROR: '+response.status+"\n");
							return;
						}
						console.log('FETCH OK!');
						response.text().then(function (data) {
							code_el.html(data);
						});
					}
				)
				.catch(function(err) {
					console.error('initCodeExpanders.fetch() NETWORK ERROR (url='+url+'): '+err);
					root.cmd.say('LOAD() NETWORK ERROR: '+err+"\n");
				});
			}
			else {
				pre_el.hide();
				$(this).attr('data-state', '0');
				$(this).html('+');
			}
		});
	},
	post_works_chk: 0,			// used to test if post_works has been run
	post_works: function() {	// runs after everything (afterMathjax), extend on pages where needed
	},
	tmp_works: function() {
	},
	afterMathjax_run: 0,
	afterMathjax: function() {
		//alert('Mathjax loaded');
		this.buildLocalLinks();
		this.buildDescOvers();
		$('div.loading_body').hide();
		$('body').css({'visibility': 'visible', 'overflow': 'visible'});
		$('div.window').css({'visibility': 'visible'});
		this.cmd.adjustCmdWindow();
		if ((this.afterMathjax_run)++ < 1) {
			$('#cmd > .cmd > input').each(function(idx) {
				//console.log('CMD_WIDTH: '+$(this).width());
				$(this).width($('#cmd > .cmd[for="cmd'+idx+'"]').width() - ($('#cmd > .cmd[for="cmd'+idx+'"] > label').width() + 18));
				//console.log('CMD_WIDTH: '+$(this).width());
			});
		}
		this.post_works();
	},
	load: function(url) {
		//console.log('INSIDE LOAD()');
		root.post_works_chk = 0;
		root.post_works = function() {};
		root.webpages.set_local_false();
		root.wins.remove_all_on_init = 1;
		root.wins.remove_all_views_on_init = 1;
		if (typeof(url) != 'undefined') {
			if (typeof(url) != 'string') return;
			console.log('TRYING URL="'+url+'"');
			if (url.indexOf('local:') >= 0) {
				root.memory.save_expander_states();
				let url_title = url.replace(/^.*local:/, '');
				if (root.webpages.load_local(url_title.express())) {
					root.cmd.cmds.cd.exec('\\');
					root.menu.activate(url);
					//history.pushState({}, '', location.href+'/'+url);
					root.spirits.init();
					root.wins.remove_all_on_init = 0;
					root.wins.remove_all_views_on_init = 0;
					root.init();
					root.cmd.cmds.dir.exec();
					MathJax.Hub.Register.StartupHook("End", function() {
						root.afterMathjax();
					});
					//MathJax.Hub.Queue(["Reprocess",MathJax.Hub]);
					MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
				}
				else
					root.cmd.say('Webpage "'+url_title+'" not found.'+"\n");
				return;
			}
			this.loading();
			fetch(url)
			.then(
				function(response) {					
					if (response.status != 200) {
						$('div.loading_body').hide();
						$('body').css({'visibility': 'visible', 'overflow': 'visible'});
						console.warn('LOAD.fetch() ERROR: '+response.status);
						if (response.status == 404)
							root.cmd.say('Webpage "'+url+'" not found.'+"\n");
						else
							root.cmd.say('LOAD() ERROR: '+response.status+"\n");
						return;
					}
					root.memory.save_expander_states();
					root.cmd.cmds.cd.exec('\\');
					console.log('FETCH OK!');
					root.menu.activate(url);
					history.pushState({}, '', url);
					response.text().then(function (data) {
						data = data.replace(/^[^]*\<body[^\>]*\>([^]*)\<\/body\>[^]*$/i, '$1');
						$('body').html(data);
						root.spirits.init();
						root.wins.remove_all_on_init = 0;
						root.wins.remove_all_views_on_init = 0;
						root.init();
						root.cmd.cmds.dir.exec();
						MathJax.Hub.Register.StartupHook("End", function() {
							root.afterMathjax();
						});
						//MathJax.Hub.Queue(["Reprocess",MathJax.Hub]);
						MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
					});
				}
			)
			.catch(function(err) {
				$('div.loading_body').hide();
				$('body').css({'visibility': 'visible', 'overflow': 'visible'});
				console.error('LOAD.fetch() NETWORK ERROR (url='+url+'): '+err);
				root.cmd.say('LOAD() NETWORK ERROR: '+err+"\n");
			});
		}
		else {
			this.loading();
			this.spirits.init();
			this.init();
		}
	},
	loading: function() {
		$('body').css({'visibility': 'hidden', 'overflow': 'hidden'});
		//$('div.window').css({'visibility': 'hidden'});	// default
		$('div.loading_body').remove();
		var el = $('<div class="loading_body"></div>');
		el.append($('<div class="container"><div class="title">'+universes[0].id+'</div><div class="subtitle">'+universes[0].subtitle+'</div><span style="font-size: 31px">.</span><span>.</span><span class="blinky">.</span></div>'));
		el.attr('id', 'loading_body');
		el.height($(window).height() - $('#cmd').outerHeight());
		el.insertAfter($('head'));
		$('div.container', el).css({'top': (el.outerHeight() / 2 - $('div.container', el).outerHeight() / 2) + 'px'});
		this.wins.alignBody();
		var x = 1, turnover = 1*666;
		var loop = function() {
			if (!(el).is(':visible')) return;
			$('div.container > span:nth-of-type('+x+')', el).css('font-size', '').fadeOut(10).fadeIn(10);
			$('div.container > span:nth-of-type('+(x=1+x%3)+')', el).css('font-size', '31px');
			setTimeout(loop, x*turnover);
		}
		setTimeout(loop, x*turnover);
	},
	init : function() {
		this.clearPast();
		this.wins.init();
		if (typeof($('div.footer').html()) == 'undefined') $('body').append($('<div class="footer"></div>'));
		this.webpages.load_remote();
		this.buildReferences();
		//this.buildChangeLog();	// moved below sreferences
		//this.buildLocalLinks();	// done in this.afterMathjax()
		this.sreferences.init();
		this.buildChangeLog();
		this.buildCiteContrib();
		this.buildFigures();
		let buildDiscussion = false;
		if (typeof($('no_discussion').html()) == 'undefined') {
			buildDiscussion = true;
			this.buildDiscussions(0);
		}
		else {
			if ($('no_discussion').html().trim() == '0' || $('no_discussion').html().trim() != '') {
				buildDiscussion = true;
				this.buildDiscussions(0);
			}
			$('no_discussion').remove();
		}
		// RENDER TEXT EXPANDERS
		let use_body_expanders = this.use_body_expanders;
		if (typeof($('set_body_expanders').html()) != 'undefined') {
			use_body_expanders = $('set_body_expanders').html();
			$('set_body_expanders').remove();
		}
		if (use_body_expanders > 0) {
			$('<div class="expander" title="Click to collapse this text block." state="1">-</div>').insertBefore($('body div.spirit:not(.main_head,.quotes,.noshow)'));
			$('body div.expander').on('click', function(e) {
				$(this).next().toggle();
				$(this).attr('state', ($(this).attr('state')>0?'0':'1'));
				$(this).attr('title', ($(this).attr('state')>0?'Click to collapse this text block.':'Click to expand this text block.'));
				$(this).html(($(this).attr('state')>0?'-':'+ '+(typeof($('h2,h3,h4', $(this).next()).html()) != 'undefined'?$('h2,h3,h4', $(this).next()).html():'')));
			});
			let ex_el = $('<div class="expander_main" title="Click to collapse all text blocks." state="1">-</div>');
			//ex_el.insertBefore($('body > div.main_head'));
			$('body > div.main_head').prepend(ex_el);
			ex_el.on('click', function(e) {
				$('body div.expander[state='+$(this).attr('state')+']').trigger('click');
				$(this).attr('state', ($(this).attr('state')>0?'0':'1'));
				$(this).attr('title', ($(this).attr('state')>0?'Click to collapse all text blocks.':'Click to expand all text blocks.'));
				$(this).html($(this).attr('state')>0?'-':'+');
			});
		}
		this.quotes.load();
		if (this.init_run_num < 1) {
			this.webpages.enum_local();
			this.plugins.init();
			this.memory.load_expander_states_from_storage();
			this.memory.load_summaries_from_storage();
			this.memory.load_pages_from_storage();
			this.cmd.init();
			this.wins.alignBody();
			this.menu.init();
			this.plugins.load_all();
		}
		else $('#cmd .cmd').show();
		if (buildDiscussion) this.buildDiscussions();
		this.memory.save_pages();
		this.init_run_num++;
		this.initCodeExpanders();
		$('.window .close_button').on('click', function(e) {
			root.observers['window'].disconnect();
			root.observers[$(this).parent().attr('id')+'view'].disconnect();
			$('html').addClass('text-center');
			$('body').animate( { 'margin-left': '0' } );
			$(this).parent().slideToggle();
			//$(this).parent().animate({'width': '0'});
		});
		$('.toggle').on('click', function (e) {
			e.preventDefault();
			$($(this).attr('data')).toggle();
		});
	}
};
// END OF root

var graph = {	
	body: null,
	body_el: '#canvas_graph_stability',
	canvas_el: 'canvas#shape_stability',
	u: null,
	c: null,
	ctx: null,
	x_offset: 50,
	y_offset: 0,
	x_caption: 'P',
	y_caption: 'N',
	y_caption_left: '',
	y_caption_place: 'left',
	max_x: 82,
	max_y: 123,
	show_arrows: false,
	arrow_width: 16,
	point_width: 3,
	point_height: 3,
	point_lineWidth: 2,
	point_strokeStyle: 'black',
	point_fillStyle: 'white',
	dot_strokeStyle: '',
	font_size: '21px',
	grid: 0,
	grid_custom: [],		// ie. [[50,66], [78,117], [82,125]]
	grid_font_size: '12px',
	coord_lines: function() {
		var x, y;
		var arrow_width = 0;
		if (this.show_arrows) arrow_width = this.arrow_width - 2;
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = this.point_strokeStyle;
		this.ctx.rect(this.x_offset, arrow_width, this.point_width-1, this.c.height);
		this.ctx.rect(0, this.y_offset, this.c.width - arrow_width, this.point_height-1);
		this.ctx.fillStyle = 'black';
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.font = this.ctx.font.replace(/[0-9]+px/, this.font_size);
		this.ctx.textAlign = 'left';
		this.ctx.fillText(this.x_caption, this.c.width - (this.x_caption.length*8 + 10), this.c.height - (this.c.height - this.y_offset) * 1/3);
		if (this.y_caption_place != 'right') {
			this.ctx.textAlign = 'right';
			this.ctx.fillText(this.y_caption, this.x_offset * 2/3, 23);
		}
		else {
			this.ctx.textAlign = 'left';
			this.ctx.fillText(this.y_caption, this.x_offset * 4/3, 23);
			if (this.y_caption_left != '') {
				this.ctx.textAlign = 'right';
				this.ctx.fillText(this.y_caption_left, this.x_offset * 2/3, 23);
			}
		}
		if (this.grid_custom.length > 0) {
			//this.ctx.lineWidth = this.point_width;
			for (x=0; x<this.grid_custom.length; x++) {
				this.ctx.beginPath();
				if (1 && this.point_width > 1)
					this.ctx.rect(this.x_offset + this.grid_custom[x][0]*this.point_width, 0, this.point_width, this.c.height - (this.c.height - this.y_offset) * 3/4);
				if (1 && this.point_height > 1)
					this.ctx.rect(this.x_offset * 3/4, this.y_offset - this.grid_custom[x][1]*this.point_height, this.c.width, this.point_height);
				this.ctx.strokeStyle = 'rgba(64,64,64,.15)';
				this.ctx.fillStyle = 'rgba(64,64,64,.15)';
				//this.ctx.strokeStyle = 'black';
				//this.ctx.fillStyle = 'black';
				this.ctx.fill();
				this.ctx.closePath();
				this.ctx.stroke();
				this.ctx.fillStyle = 'black';
				this.ctx.font = this.ctx.font.replace(/[0-9]+px/, this.grid_font_size);
				this.ctx.textAlign = 'left';
				this.ctx.fillText(this.grid_custom[x][0], this.x_offset + this.grid_custom[x][0]*this.point_width - (this.grid_custom[x][0].toString().length*3), this.c.height - (this.c.height - this.y_offset) * 0.45);
				this.ctx.textAlign = 'right';
				this.ctx.fillText(this.grid_custom[x][1], this.x_offset * 2/3, this.y_offset - (this.grid_custom[x][1]*this.point_height - 6));
				if (0) {
					this.ctx.strokeStyle = 'black';
					this.ctx.beginPath();
					this.ctx.moveTo(this.x_offset + this.grid_custom[x][0]*this.point_width, 0);
					this.ctx.lineTo(this.x_offset + this.grid_custom[x][0]*this.point_width, this.c.height - (this.c.height - this.y_offset) * 3/4);
					this.ctx.closePath();
					this.ctx.stroke();
					if (this.point_width > 1) {
						this.ctx.beginPath();
						this.ctx.moveTo(this.x_offset + this.grid_custom[x][0]*this.point_width + this.point_width, 0);
						this.ctx.lineTo(this.x_offset + this.grid_custom[x][0]*this.point_width + this.point_width, this.c.height - (this.c.height - this.y_offset) * 3/4);
						this.ctx.closePath();
						this.ctx.stroke();
					}
					this.ctx.beginPath();
					this.ctx.moveTo(this.x_offset * 3/4, this.y_offset - this.grid_custom[x][1]*this.point_height);
					this.ctx.lineTo(this.c.width, this.y_offset - this.grid_custom[x][1]*this.point_height);
					this.ctx.closePath();
					this.ctx.stroke();
					if (this.point_height > 1) {
						this.ctx.beginPath();
						this.ctx.moveTo(this.x_offset * 3/4, this.y_offset - this.grid_custom[x][1]*this.point_height - this.point_height);
						this.ctx.lineTo(this.c.width, this.y_offset - this.grid_custom[x][1]*this.point_height - this.point_height);
						this.ctx.closePath();
						this.ctx.stroke();
					}
				}
			}
			//this.ctx.lineWidth = 1;
		}
		if (this.grid) {
			this.ctx.lineWidth = this.point_lineWidth;
			for (x=0; x<(this.c.width-this.x_offset); x=x+this.point_width) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.x_offset + x, 0);
				this.ctx.lineTo(this.x_offset + x, this.c.height - this.x_offset);
				this.ctx.strokeStyle = "rgba(64,64,64,.075)";
				this.ctx.stroke();
			}
			for (y=0; y<(this.c.height-this.x_offset); y=y+this.point_height) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.x_offset, this.y_offset - y);
				this.ctx.lineTo(this.c.width, this.y_offset - y);
				this.ctx.strokeStyle = "rgba(64,64,64,.075)";
				this.ctx.stroke();
			}
		}
	},
	arrows: function() {
		if (!this.show_arrows) return;
		this.ctx.strokeStyle = this.point_strokeStyle;
		this.ctx.fillStyle = 'black';
		this.ctx.beginPath();
		this.ctx.moveTo(this.c.width - this.arrow_width, this.y_offset + this.point_height + 3);
		this.ctx.lineTo((this.c.width - this.arrow_width) + 3, this.y_offset + this.point_height / 2);	// inset
		this.ctx.lineTo(this.c.width - this.arrow_width, this.y_offset - 3);
		this.ctx.lineTo(this.c.width, this.y_offset + this.point_height / 2);
		this.ctx.lineTo(this.c.width - this.arrow_width, this.y_offset + this.point_height + 3);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.moveTo(this.x_offset + this.point_width + 3, this.arrow_width);
		this.ctx.lineTo(this.x_offset + this.point_width / 2, this.arrow_width - 3);	// inset
		this.ctx.lineTo(this.x_offset - 3, this.arrow_width);
		this.ctx.lineTo(this.x_offset + this.point_width / 2, 0);
		this.ctx.lineTo(this.x_offset + this.point_width + 3, this.arrow_width);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
	},
	dot: function(x, y, nostroke=false) {
		this.ctx.beginPath();
		this.ctx.rect(this.x_offset + x*this.point_width, this.y_offset - y*this.point_height, this.point_width, this.point_height);	// left, top, width, height
		this.ctx.lineWidth = this.point_lineWidth;
		this.ctx.strokeStyle = (this.dot_strokeStyle==''?this.point_strokeStyle:this.dot_strokeStyle);
		this.ctx.fillStyle = this.point_fillStyle;
		this.ctx.fill();
		if (!nostroke)
			this.ctx.stroke();
	},
	init: function(settings = null) {
		var scale = window.devicePixelRatio;
		var keysSettings = Object.keys(settings);
		for (let i=0; i<keysSettings.length; i++) {
			this[keysSettings[i]] = settings[keysSettings[i]];
		}
		this.body = $(this.body_el);
		this.u = $(this.canvas_el, this.body)[0];
		this.c = {
			canvas: null,
			width: 0,
			height: 0
		}
		this.c.canvas = this.u.getContext('2d');
		this.body.css({ 'margin': '18px 0 0 0', 'overflow': 'hidden' });
		var $c = this.c;
		var ctx = $c.canvas;
		//this.c.width = this.body.width();
		this.c.width = this.point_width * this.max_x + this.x_offset + 60;
		//this.c.height = this.body.width() / 2;
		this.c.height = this.point_height * this.max_y + this.x_offset + 60;
		this.u.style.width = this.c.width + 'px';
		this.u.style.height = this.c.height + 'px';
		this.u.width = this.c.width * scale;
		this.u.height = this.c.height * scale;
		this.body.width(this.c.width);
		this.body.height(this.c.height);
		this.c.canvas.scale(scale, scale);
		this.ctx = ctx;
		this.y_offset = $c.height - this.x_offset;
		this.coord_lines();
		this.arrows();
	}
}

$(document).ready(function() {	
	jQuery.fn.extend({
		scrollToMe: function (el = 'html,body') {
			if (typeof jQuery(this).offset() == 'undefined') {
				console.warn('offset() undefined');
				return false;
			}
			var x = jQuery(this).offset().top - 100;
			jQuery(el).animate({scrollTop: x}, 500);
		},
		scrollToBottom: function (el = 'html,body') {
			var x = jQuery(el).scrollTop() + $(window).height();
			jQuery(el).animate({scrollTop: x}, 500);
		},
		latexEl: function() {
			let $this = $(this);
			$('sub, sup', $this).each(function (idx, subp) {
				$(this).html('$'+(($(this).prop('tagName') == 'SUB')?'_':'^')+'{'+$(this).html()+'}$');
				$('sub, sup', subp).each(function(idx2, subp2) {
					$(subp2).html((($(subp2).prop('tagName') == 'SUB')?'_':'^')+'{'+$(this).html()+'}');
					$('sub, sup', subp2).each(function(idx2, subp3) {
						//console.log('BEFORE:'+$(this).html());
						$(subp3).html((($(subp3).prop('tagName') == 'SUB')?'_':'^')+'{'+$(this).html()+'}');
						//console.log('AFTER:'+$(this).html());
					});
				});
			});
		},
		hasAttribute: function(a) {
			if (typeof(jQuery(this).attr(a)) != typeof undefined && jQuery(this).attr(a) !== false) return true;
			return false;
		},
		getCharWidth: function(charwidth = 10) {
			//console.log('THEWIDTH = '+jQuery(this).width());
			return Math.floor(jQuery(this).width() / charwidth);
		},
		fixSpiritCaption: function() {
			let $this = $(this);
			let data_type = $this.attr('data-type').replace('h2', 'sub1').replace('h3', 'sub2').replace('h4', 'sub3'), tag = '';
			var data_type_original = $this.attr('data-type');
			if (typeof $this.children().first().prop("tagName") != 'undefined')
				tag = $this.children().first().prop("tagName").toLowerCase().replace('h2', 'sub1').replace('h3', 'sub2').replace('h4', 'sub3');
			let caption = (data_type!=tag?'New':$this.children().first().html().stripTags(2).replace('\\', '').trim());
			var caption_lo = caption.toLowerCase();
			var i = 1, up_data_type = (data_type == 'sub3'?'h3':(data_type=='sub2'?'h2':''));
			var all_searched = false, curEl, curElTag;
			while (!all_searched) {
				all_searched = true;
				$this.prevAll('.spirit').each(function (idx) {
					curEl = $(this).children().first();
					if (typeof curEl.prop("tagName") != 'undefined') {
						curElTag = curEl.prop("tagName").toLowerCase();
						//console.log('PREV_'+$(this).prop("tagName")+': '+curEl.prop("tagName"));
						if (curElTag == up_data_type) return false;	// break
						if (curElTag == data_type_original) {
							if (curEl.html().toLowerCase() == caption_lo+(i>1?' '+i:'')) {
								++i;
								all_searched = false;
								return false;
							}
						}
					}
				});
				if (all_searched) {
					$this.nextAll('.spirit').each(function (idx) {
						curEl = $(this).children().first();
						//console.log('NEXT_'+$(this).prop("tagName")+': '+curEl.prop("tagName"));
						if (typeof curEl.prop("tagName") != 'undefined') {
							curElTag = curEl.prop("tagName").toLowerCase();
							if (curElTag == up_data_type) return false;	// break
							if (curElTag == data_type_original) {
								if (curEl.html().toLowerCase() == caption_lo+(i>1?' '+i:'')) {
									++i;
									all_searched = false;
									return false;
								}
							}
						}
					});
				}
			}
			if (data_type != tag) 
				$this.prepend($('<'+data_type+'>'+caption+(i>1?' '+i:'')+'</'+data_type+'>'));
			else
				$this.children().first().html(caption+(i>1?' '+i:''));
			$this.children().first().attr('hash', $this.children().first().html().stripTags(2).toLowerCase().hashCode());
		},
		cleanSpirit: function(text = false) {
			var x = jQuery(this);
			if (x.hasClass('pre')) return;
			if (text)
				x.html(x.html().replace(/\n*&lt;br&gt;\n*/g, "\n").replace(/&lt;span class="indent"&gt;&lt;\/span&gt;\n*/g, "\t").replace(/\n+(&lt;h)/g, '$1'));
			else
				x.html(x.html().replace(/\n*\<br\>\n*/g, "\n").replace(/\<span class="indent"\>\<\/span\>\n*/g, "\t").replace(/\n+(\<h)/g, '$1'));
		},
		formatSpirit: function(text = false) {
			var x = jQuery(this);
			if (x.hasClass('pre')) return;
			//x.html(x.html().replace(/\n*\<br\>\n*/g, "\n").replace(/\<span class="indent"\>\<\/span\>\n*/g, "\t").replace(/\n+(\<h)/g, '$1'));
			this.cleanSpirit(text);
			if (text) {
				x.html(x.html().replace(/&gt;\n+&lt;/g, '&gt;&lt;').replace(/([^.\?\s\&gt;]\s*)\n+/g, '$1').replace(/\n/g, '&lt;br&gt;').replace(/\t([^\&])/g, '&lt;span class="indent"&gt;&lt;/span&gt;$1').replace(/\n*(&lt;\/h[0-9]+&gt;)\n*(&lt;br&gt;)?\s*(&lt;span class="indent"&gt;&lt;\/span&gt;)?([^\&])/g, '$1&lt;br&gt;&lt;span class="indent"&gt;&lt;/span&gt;$4').replace(/(&lt;\/h[134567890]&gt;)&lt;br&gt;/g, '$1').replace(/(ul|li|table)&gt;&lt;br&gt;/g, '$1&gt;'));
				x.html(x.html().replace(/\n*(&lt;br&gt;[\s\r\n]*|&lt;span class="indent"&gt;&lt;\/span&gt;[\s\r\n]*)+&lt;table/g, '&lt;table'));
				x.html(x.html().replace(/&lt;br&gt;([A-ZČĆŽŠĐ])/g, "&lt;br&gt;&lt;br&gt;&lt;span class=\"indent\"&gt;&lt;/span&gt;$1"));
				x.html(x.html().replace(/&gt;&lt;br&gt;&lt;br&gt;/g, "&gt;"));
			}
			else {
				x.html(x.html().replace(/\>\n+\</g, '><').replace(/([^.\?\s\>]\s*)\n+/g, '$1').replace(/\n/g, '<br>').replace(/\t([^\<])/g, '<span class="indent"></span>$1').replace(/\n*(\<\/h[0-9]+\>)\n*(\<br\>)?\s*(\<span class="indent"\>\<\/span\>)?([^\<]+)/g, '$1<br><span class="indent"></span>$4').replace(/(\<\/h[134567890]\>)\<br\>/g, '$1').replace(/(ul|li|table)\>\<br\>/g, '$1>'));
				x.html(x.html().replace(/\n*(\<br\>[\s\r\n]*|\<span class="indent"\>\<\/span\>[\s\r\n]*)+\<table/g, '<table'));
				x.html(x.html().replace(/\<br\>([A-ZČĆŽŠĐ])/g, "<br><br><span class=\"indent\"></span>$1"));
				x.html(x.html().replace(/\>\<br\>\<br\>/g, ">"));
			}
		},
		removeTypeset: function(el = false) {
			if (el === false) el = root.editable.oDoc;
			//jax = MathJax.Hub.getAllJax();	// for all jax in the document
			var HTML = MathJax.HTML, jax = MathJax.Hub.getAllJax(el);
			for (var i=0, m=jax.length; i<m; i++) {
				var script = jax[i].SourceElement(), tex = jax[i].originalText;
				if (script.type.match(/display/)) { tex = "\\\\["+tex+"\\\\]" } else { tex = "\\\\("+tex+"\\\\)" }
				jax[i].Remove();
				var preview = script.previousSibling;
				if (preview && preview.className === "MathJax_Preview") {
					preview.parentNode.removeChild(preview);
				}
				//preview = HTML.Element("span", {className:"MathJax_Preview"}, [tex]);
				//preview = HTML.TextNode([tex]);
				//script.parentNode.insertBefore(preview,script);
				//$(script).replaceWith(preview);
			}
		},
		removeTypesetAlt: function() {	// use for plain text mathjax removal
			$(this).html($(this).html().replace(/\<span class="MathJax_Preview"[\s\S]+?\s+type="math\/tex"[^\>]*\>([\s\S]*?)\<\/script\>/g, '$$$1$$'));
		},
		transformSpirit: function(text = false) {
			var tmp;
			if (text) {
				this.formatSpirit(text);
				tmp = $(this).html();
				tmp = tmp.replace(/&lt;e&gt;(.*?)&lt;\/e&gt;/gi, '&lt;p class="equation"&gt;$1&lt;/p&gt;');
				tmp = tmp.replace(/&lt;author\s*\/&gt;/gi, '&lt;div class="author"&gt;'+universes.author()+(universes.anno()?', &lt;br noformat&gt;&lt;br noformat&gt;'+universes.anno():'')+'&lt;/div&gt;');
				tmp = tmp.replace(/&lt;right&gt;(.*?)&lt;\/right&gt;/gi, '&lt;div class="right"&gt;$1&lt;/div&gt;');
				tmp = tmp.replace(/&lt;(def|explain)&gt;(.*?)&lt;\/(def|explain)&gt;/gi, '&lt;div class="$1"&gt;$2&lt;/div&gt;');
				tmp = tmp.replace(/&lt;color code="([0-9]+)"&gt;(.*?)&lt;\/color&gt;/gi, '&lt;span style="color: #$1"&gt;$2&lt;/span&gt;');
				tmp = tmp.replace(/&lt;(\/?)title(.*)?&gt;/gi, '&lt;$1'+'h1$2'+'&gt;');
				tmp = tmp.replace(/&lt;(\/?)sub1(.*)?&gt;/gi, '&lt;$1'+'h2$2'+'&gt;');
				tmp = tmp.replace(/&lt;(\/?)sub2(.*)?&gt;/gi, '&lt;$1'+'h3$2'+'&gt;');
				tmp = tmp.replace(/&lt;(\/?)sub3(.*)?&gt;/gi, '&lt;$1'+'h4$2'+'&gt;');
				tmp = tmp.replace(/&lt;state&gt;(.*?)&lt;\/state&gt;/gi, '&lt;div class="state"&gt;$1&lt;/div&gt;');
				tmp = tmp.replace(/&lt;song&gt;(.*?)&lt;\/song&gt;/gi, '&lt;div class="song"&gt;$1&lt;/div&gt;');
				tmp = tmp.replace(/&lt;update(.*?)&gt;(.*?)&lt;\/update&gt;/gi, '&lt;div class="update"$1&gt;$2&lt;/div&gt;');
				//tmp = tmp.replace(/\^([0-9]+)/g, '&lt;sup&gt;$1&lt;/sup&gt;');
				tmp = root.eval(tmp, true);
				//$(this).replaceWith('<div class="spirit '+($(this).attr('class')?$(this).attr('class'):'')+'">'+tmp+'</div>');
				$(this).html(tmp);
			}
			else {
				var i, j, out;
				$('color', this).each(function (idx2) {
					if ($(this).attr('code')) {
						tmp = $(this).attr('code').split(',');
						out = '';
						for (i=0, j=$(this).text().length/tmp.length; i<tmp.length; i++) {
							if (i == tmp.length - 1) j += $(this).text().length % tmp.length;
							if (tmp[i].match(/^[0-9a-f]{2}/i)) tmp[i] = '#'+tmp[i];
							out += '<span style="color: '+tmp[i]+'">'+$(this).text().substring(i, i+j)+'</span>';
						}
						$(this).replaceWith(out);
					}
					else 
						$(this).replaceWith('<span style="color: '+$(this).text().replace(/^[^#0-9a-z]*([#0-9a-z]+)[^#0-9a-z]*$/i, '$1')+'">'+$(this).html()+'</span>');
				});
				$('author', this).each(function(idx2) {
					$(this).replaceWith('<div class="author">'+universes.author()+(universes.anno()?', <br noformat><br noformat>'+universes.anno():'')+'</div>');
				});
				$('def, explain, song, state, right', this).each(function(idx2) {
					let tmpattrs = '', tmpcls = '';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					if ($(this).hasAttribute('class')) tmpcls = ' '+$(this).attr('class');
					$(this).replaceWith('<div class="'+$(this).prop("tagName").toLowerCase()+tmpcls+'"'+tmpattrs+'>'+$(this).html()+'</div>');
				});
				$('e', this).each(function(idx2) {
					$(this).replaceWith('<p class="equation">'+$(this).html()+'</p>');
				});
				$('update', this).each(function(idx2) {
					$(this).replaceWith('<div class="update"'+($(this).hasAttribute('date')?' date="'+$(this).attr('date')+'"':'')+($(this).hasAttribute('nolink')?' nolink="'+$(this).attr('nolink')+'"':'')+'>'+$(this).html()+'</div>');
				});
				$('title', this).each(function(idx2) {
					let tmpattrs = '';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					if ($(this).hasAttribute('class')) tmpattrs += ' class="'+$(this).attr('class')+'"';
					$(this).replaceWith('<h1'+tmpattrs+'>'+$(this).html()+'</h1>');
				});
				$('sub1, sub2, sub3', this).each(function(idx2) {
					tmp = Number($(this).prop("tagName").replace(/^SUB([0-9]*)$/, '$1')) + 1;
					if (tmp < 2) tmp = 2;
					let tmpattrs = '';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					if ($(this).hasAttribute('class')) tmpattrs += ' class="'+$(this).attr('class')+'"';
					if ($(this).hasAttribute('hash')) tmpattrs += ' hash="'+$(this).attr('hash')+'"';
					if ($(this).hasAttribute('idx')) tmpattrs += ' idx="'+$(this).attr('idx')+'"';
					if ($(this).hasAttribute('no_numbering')) tmpattrs += ' no_numbering="'+$(this).attr('no_numbering')+'"';
					$(this).replaceWith('<h'+tmp+tmpattrs+'>'+$(this).html()+'</h'+tmp+'>');
				});
				tmp = $(this).html();
				//tmp = tmp.replace(/\^([0-9]+)/g, '<sup>$1</sup>');
				tmp = root.eval(tmp);
				/*
				tmp = tmp.replace(/&lt;(\/?)[0-9]+&gt;/g, '<$1h2>').replace(/\<!--[0-9]+--\>/g, '</h2>');
				tmp = tmp.replace(/&lt;(\/?)[0-9]+\.[0-9]+&gt;/g, '<$1h3>').replace(/\<!--[0-9]+\.[0-9]+--\>/g, '</h3>');
				tmp = tmp.replace(/&lt;(\/?)[0-9]+\.[0-9]+\.[0-9]+&gt;/g, '<$1h4>').replace(/\<!--[0-9]+\.[0-9]+\.[0-9]+--\>/g, '</h4>');
				*/
				if (!$(this).hasClass('spirit'))
					$(this).replaceWith('<div class="spirit'+($(this).attr('class')?' '+$(this).attr('class'):'')+'">'+tmp+'</div>');
				else
					$(this).html(tmp);
			}
		},
		untransformSpirit: function(text = false) {
			var tmp;
			if (text) {
				this.cleanSpirit();
				tmp = $(this).html();
				tmp = tmp.replace(/\<p class="equation"\>(.*?)\<\/p\>/gi, '<e>$1</e>');
				tmp = tmp.replace(/\<div class="author"\>(.*?)\<\/div\>/gi, '<author />');
				tmp = tmp.replace(/\<div class="right"\>(.*?)\<\/div\>/gi, '<right>$1</right>');
				tmp = tmp.replace(/\<div class="(def|explain)"\>(.*?)\<\/div\>/gi, '<$1>$2</$1>');
				tmp = tmp.replace(/\<span style="color: #([0-9]+)"\>(.*?)\<\/span\>/gi, '<color code="$1">$2</color>');
				tmp = tmp.replace(/\<(\/?)h1([^\>]*)\>/gi, '<$1'+'title$2'+'>');
				tmp = tmp.replace(/\<(\/?)h2([^\>]*)\>/gi, '<$1'+'sub1$2'+'>');
				tmp = tmp.replace(/\<(\/?)h3([^\>]*)\>/gi, '<$1'+'sub2$2'+'>');
				tmp = tmp.replace(/\<(\/?)h4([^\>]*)\>/gi, '<$1'+'sub3$2'+'>');
				tmp = tmp.replace(/\<div class="song"\>(.*?)\<\/div\>/gi, '<song>$1</song>');
				tmp = tmp.replace(/\<div class="state"\>(.*?)\<\/div\>/gi, '<state>$1</state>');
				tmp = tmp.replace(/\<div class="update"(.*?)\>(.*?)\<\/div\>/gi, '<update$1>$2</update>');
				//tmp = tmp.replace(/\<sup\>(.*?)\<\/sup\>/gi, '^$1');
				//$(this).replaceWith('<spirit'+($(this).attr('class')?' class="'+$(this).attr('class')+'"':'')+'>'+tmp+'</spirit>');
				$(this).html(tmp);
			}
			else {
				var match, myRegexp = /color: #([0-9a-z]+)/i;
				$('span[style]', this).each(function(idx2) {
					match = myRegexp.exec($(this).attr('style'));
					if (match !== null && typeof(match[1]) != 'undefined') {
						$(this).replaceWith('<color code="'+match[1]+'">'+$(this).html()+'</color>');
					}
				});
				$('div.author', this).each(function(idx2) {
					$(this).replaceWith('<author />');
				});
				$('div.def, div.explain, div.song, div.state, div.right', this).each(function(idx2) {
					let cls = $(this).attr('class'), tmpattrs = '';
					let el = cls;
					if (el.indexOf(' ') > 0) el = el.split(' ')[0];
					cls = cls.replace(el, '').trim();
					if (cls.length > 0) cls = ' class="'+cls+'"';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					$(this).replaceWith('<'+el+cls+tmpattrs+'>'+$(this).html()+'</'+el+'>');
				});
				$('div.update', this).each(function(idx2) {
					$(this).replaceWith('<update'+($(this).hasAttribute('date')?' date="'+$(this).attr('date')+'"':'')+'>'+$(this).html()+'</update>');
				});
				$('p.equation', this).each(function(idx2) {
					$(this).replaceWith('<e>'+$(this).html()+'</e>');
				});
				$('h1', this).each(function(idx2) {
					let tmpattrs = '';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					if ($(this).hasAttribute('class')) tmpattrs += ' class="'+$(this).attr('class')+'"';
					$(this).replaceWith('<title'+tmpattrs+'>'+$(this).html()+'</title>');
				});
				$('h2,h3,h4', this).each(function(idx2) {
					tmp = Number($(this).prop("tagName").replace(/^H([0-9]+)$/, '$1')) - 1;
					let tmpattrs = '';
					if ($(this).hasAttribute('style')) tmpattrs += ' style="'+$(this).attr('style')+'"';
					if ($(this).hasAttribute('class')) tmpattrs += ' class="'+$(this).attr('class')+'"';
					if ($(this).hasAttribute('hash')) tmpattrs += ' hash="'+$(this).attr('hash')+'"';
					if ($(this).hasAttribute('idx')) tmpattrs += ' idx="'+$(this).attr('idx')+'"';
					$(this).replaceWith('<sub'+tmp+tmpattrs+'>'+$(this).html()+'</sub'+tmp+'>');
				});
				//$(this).html($(this).html().replace(/\<sup\>(.*?)\<\/sup\>/gi, '^$1'));
				//$(this).replaceWith('<spirit'+($(this).attr('class')?' class="'+$(this).attr('class')+'"':'')+'>'+$(this).html()+'</spirit>');
			}
		}
	});
	var waitForFinalEvent = (function() {	// useful for events like onresize() when you want to execute something when resizing is done
		var timers = {};
		return function(callback, ms, uniqueId) {
			if (!uniqueId)
				uniqueId = "Don't call this twice without a uniqueId";
			if (timers[uniqueId])
				clearTimeout(timers[uniqueId]);
			timers[uniqueId] = setTimeout(callback, ms);
		};
	})();
	$(window).on('resize', function() {
		waitForFinalEvent(function() {
			root.cmd.adjustCmdWindow();
			root.wins.alignBody();
		}, 500, "unique_id");
	});
	$.ajax({
		url: '/universes.js',
		dataType: 'script',
		cache: true
	}).done(function() {
		universes.init();
		universes.solar_system.init();
		root.load();
	}).fail(function (xhr, status, error) {
		console.error('universes.js LOAD ERROR '+xhr.status+': '+xhr.statusText);
	});
});