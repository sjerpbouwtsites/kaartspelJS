//KAARTENSPEL 1.1
//GEMAAKT DOOR SJERP VAN WOUDEN / VAN WENS TOT WEBSITE
//OPEN SOURCE ZOLANG JE HET NIET ZELF GAAT DOORVERKOPEN OF PRETENDEERT DAT HET JE EIGEN WERK IS!


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

// GEREEDSCHAP

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

var gr = {

	geenPx: function(a) {
		return Number(a.replace('px', ''));
	},

	metPx: function(a){
		return a + 'px';
	},

	onlyUnique: function (value, index, self) {
		return self.indexOf(value) === index;
	},

	seqExec: function(obj, seq, params){

		// params: object met functies, array met strings met functienamen.
		// Worden in sequentie uitgevoerd.

		for (var f in seq) {
			obj[(seq[f])](params);
		}
	},

	stijl: function(el, stijlObj){

		for (var prop in stijlObj) {
			el.style[prop] = stijlObj[prop];
		}

	},

	kloon: function(a){

		//kopieer array zonder referentie achter te laten

		var
		r = [], i, l = a.length;

		for (i = 0; i < l; i++) {
			r.push(a[i]);
		}

		return r;
	},

	verstop: function(nodes){
		this.vtGen(nodes, 'none');
	},

	toon: function(nodes){
		this.vtGen(nodes, 'block');
	},

	vtGen: function(nodes, doe){

		//enkel element? nodes is node
		var enkel = nodes instanceof HTMLElement;

		if (enkel) {
			nodes.style.display = doe;
		} else {
			var l = nodes.length;
			for (var i = 0; i < l; i++) {
				nodes[i].style.display = doe;
			}
		}

	},

	isZichtbaar: function (el) {
		var vierk = el.getBoundingClientRect();
		var schermMax = Math.max(document.documentElement.clientHeight, window.innerHeight);
		return {
			boven: !(vierk.top < 0 || vierk.top - schermMax >= 0),
			onder: !(vierk.bottom < 0 || vierk.bottom - schermMax >= 0),
			relBoven: vierk.top / el.clientHeight,
			relOnder: vierk.top / el.clientHeight,
		};
	}

};

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

// MODEL

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

var mod = {

	//initialisatie
	init: function(){

		var _m = this;

		_m.huiUrl = document.URL;

		_m.afbsCol = document.getElementsByClassName('afb');
		_m.afbsLength = _m.afbsCol.length;

		_m.afbs = [];
		for (var i = 0; i < _m.afbsLength; i++) {
			_m.afbs.push(new _m.afb(_m.afbsCol[i]));
		}

		_m.houder = document.getElementById('tegelhouder');
		_m.afbGroep = document.getElementsByClassName('afb-groep')[0];

		_m.layDat = {
			richting: ['t', 'r', 'b', 'l'],
			vglMat: {
				t: ['b', 't'],
				r: ['l', 'r'],
				b: ['b', 't'],
				l: ['l', 'r']
			},
			huiRich: 0,
			iter: 0,
			werkIterBij: function(){
				_m.layDat.iter++;
			},
			gaatRecht: false,
			opmaak: {
				marge: 10,
				maxRijen: 6, //later te bepalen
				maxKolommen: 99, //later te bepalen.
				maxCirculair: 99,
				huiAantRijen: 1,
				scale: 1.02,
			},
			hypWind: function (r) {
				var l = _m.layDat;
				return r[((  l['huiRich'] + 1 < 4 ? l['huiRich'] + 1 : 0))];
			},
			rijAantal: {
				huiBer: 0,
				breekpunten: [0, 1, 3, 7, 13, 21, 31, 43, 57, 73],
				rekenCirkel: function(tegels){
					var h = _m.layDat.rijAantal,
						t = tegels+1;
						r = {verschuif: false};
					//komt tegels voor in breekpunten? verwerk in huiBer.
					//breekpunten array index is aantal rijen.
					if (h.breekpunten.indexOf(t) !== -1) {
						h.huiBer = h.breekpunten.indexOf(t);
						r.verschuif = true;
					}
					r.huiRijen = h.huiBer;
					return r;

				},
				rekenRecht: function(){
					var h = _m.layDat.rijAantal;
					h.huiBer++;
					return {
						verschuif: true,
						huiRijen: h.huiBer,
					};
				},
			},
		};

		_m.patroon = [true, true, true, true]; //eerste vier bocht

		for (i = 1; i < 20; i++) { // 20 is arbitrair getal, aantal schillen

			for (var k = 0; k < 2; k++) {
				for (var j = 0; j < i; j++) {
					_m.patroon.push(false);
				}
				_m.patroon.push(true);
			}

		}

		_m.bereik = function(b, e){
			var l = e || _m.afbsLength;
			var r = [];
			for (var i = 0; i <= l; i++) {
				r.push((b + i));
			}
			return r;
		};

		//de tegels van links naar rechts boven naar onder gelezen naar printvolgorde. tbv lightbox.
		_m.rijPatroon = [];

		_m.bepaalRijPatroon = function(){

			var onbewerkt = [];

			switch (_m.layDat.opmaak.maxKolommen) {

				case 2:
					onbewerkt = [1, 2, 4, 3]
					.concat(_m.bereik(5, _m.afbsLength - 5));
				break;

				case 3:
					onbewerkt = [7, 8, 9, 6, 1, 2, 5, 4, 3]
					.concat(_m.bereik(10, _m.afbsLength - 10));
				break;

				case 4:
					onbewerkt = [7, 8, 9, 10, 6, 1, 2, 11, 5, 4, 3, 12, 16, 15, 14, 13]
					.concat(_m.bereik(17, _m.afbsLength - 17));
				break;

				case 5:
					onbewerkt = (_m.bereik(21, 4))
					.concat([20, 7, 8, 9, 10, 19, 6, 1, 2, 11, 18, 5, 4, 3, 12, 17, 16, 15, 14, 13])
					.concat(_m.bereik(26, _m.afbsLength - 26));
				break;

				case 6:
					onbewerkt = (_m.bereik(21, 5))
					.concat([20, 7, 8, 9, 10, 27, 19, 6, 1, 2, 11, 28, 18, 5, 4, 3, 12, 29, 17, 16, 15, 14, 13, 30, 36, 35, 34, 33, 32, 31])
					.concat(_m.bereik(37, _m.afbsLength - 37));
				break;

				case 7:
					onbewerkt = (_m.bereik(43, 6))
					.concat([42])
					.concat(_m.bereik(21, 5))
					.concat([41, 20, 7, 8, 9, 10, 27, 40, 19, 6, 1, 2, 11, 29, 39, 18, 5, 4, 3, 12, 29, 38, 17, 16, 15, 14, 13, 30, 37, 36, 35, 34, 33, 32, 31])
					.concat(_m.bereik(50, _m.afbsLength - 50));
				break;

				case 8:
					onbewerkt = (_m.bereik(43, 7))
					.concat([42])
					.concat(_m.bereik(21, 5))
					.concat([51])
					.concat([41, 20, 7, 8, 9, 10, 27, 52, 40, 19, 6, 1, 2, 11, 28, 53, 39, 18, 5, 4, 3, 12, 39, 54, 38, 17, 16, 15, 14, 13, 30, 52, 37, 36, 35, 34, 33, 32, 31, 51, 64, 63, 62, 61, 60, 59, 58, 57])
					.concat(_m.bereik(65, _m.afbsLength - 65));
				break;

				case 9:
					onbewerkt = (_m.bereik(73, 8))
					.concat([72])
					.concat(_m.bereik(43, 7))
					.concat([71, 42, 21, 22, 23, 24, 25, 26, 51, 70, 41, 20, 7, 8, 9, 10, 27, 52, 69, 40, 19, 6, 1, 2, 11, 28, 53, 68, 39, 18, 5, 4, 3, 12, 29, 54, 67, 38, 17, 16, 15, 14, 13, 30, 53, 66, 37, 36, 35, 34, 33, 32, 31, 56, 65, 64, 63, 62, 61, 60, 59, 58, 57])
					.concat(_m.bereik(81, _m.afbsLength - 81));
				break;

				default:
					onbewerkt = _m.bereik(1);
				break;

			}

			var gefilterd = [];

			//nu er uit gooien wat niet daadwerkelijk voorkomt...mocht dat niet juist zijn gegaan.
			for (var i = 0; i < onbewerkt.length; i++) {
				if (onbewerkt[i] <= _m.afbsLength) {
					gefilterd.push(onbewerkt[i]);
				}
			}

			_m.rijPatroon = gefilterd;
			_m.rijPatrJoin = gefilterd.join();

		};

		_m.posities = {
			laatstePos: {},
			bezetGebied: {
				blokken: [],
				t: [],
				r: [],
				b: [],
				l: []
			},
			nweLaatstePos: function(pos){
				this.laatstePos = pos;
			},
		};

		_m.imgData = {
			ratios: [],
			imgs: [],
			aantalGeladen: 0,
			naLaden: function(){
				this.aantalGeladen++;
				return this.aantalGeladen === mod.afbsLength;
			},
			slaImgOp: function(img){

				var
				s = _m.layDat.opmaak.scale,
				b = img.naturalWidth / s,
				h = img.naturalHeight / s;

				this.ratios.push(b/h);
				this.imgs.push([b, h]);
			}

		};

		_m.huiFormaat = {
			b: 0,
			h: 0,
			pak: function(){

				if (!this.b || !this.h){

					var a = _m.p('afbs');
					var o = (_m.p('layDat')).opmaak;

					this.b = a[0].el.clientWidth;
					this.h = a[0].el.clientHeight;
					this.opp = (this.b + 2 * o.marge) * (this.h + 2 * o.marge);

				}
				return this;
			},
		};

		_m.rijPrinten = { //voor overloop na circulair
			rij: 0,
			kol: 0,
			onderkantW: 0,
			linkerMargeW: 0,
			gestart: false,
			onderkant: function(){

				if (this.kol === 0 || !this.onderkantW) { //nieuwe rij, bepaal hoogte.
					var diepst = Math.max.apply(Math, _m.posities.bezetGebied.t);
					this.onderkantW = diepst + (_m.huiFormaat.pak()).h;
				}
				return this.onderkantW;

			},
			linkerMarge: function(){

				if (this.rij === 0 || !this.linkerMargeW) { //eerste rij, bepaald linkermarge.
					this.linkerMargeW = Math.min.apply(Math, _m.posities.bezetGebied.l);
				}
				return this.linkerMargeW;
			},
			kolNaarRij: function(){

				//aan rijAantalBer true geven als nieuwe rij
				var r = this.kol === 0;
				this.kol++;
				if (this.kol >= _m.layDat.opmaak.maxKolommen) {
					this.kol = 0;
					this.rij++;
				}
				return r;
			}
		};

		_m.stConfig = {
			m: 'mod',
			c: 'ctrl',
			mod: {
				ld: 'layDat',
				pos: 'posities',
				afbs: 'afbs',
				afbGroep: 'afbGroep',
				imgs: 'imgData',
			},
			blokDim: _m.huiFormaat.pak(),
		};

	},

	//st obj

	snelToegang: function(){

		//adh stConfig worden standaard variabelen meegegeven aan functies.
		var
		r = {},
		c = this.p('stConfig'),
		w = window;


		for (var k in c) {

			var b = w[(c[k])];

			if (typeof c[k] !== 'object') {

				//global variabele.
				r[k] = b;

			} else {

				//obj methode
				var
				modObj = w[k],
				cObj = c[k];

				if (modObj) { //via referentie

					for (var sk in cObj) {
						r[sk] = modObj[(cObj[sk])];
					}
				} else { //directe invoer

					r[k] = cObj;
				}

			}
		}

		return r;

	},

	afb: function(el){
		this.el = el;
		this.plaats = function(pos){

			this.el.style.left = gr.metPx(pos.l);
			this.el.style.top = gr.metPx(pos.t);

			if (pos.isRij) {
				this.el.className = this.el.className + ' als-rij';
			}

		};
		this.maakStijlen = function(iter){
			this.rotSnelheid = (iter / 9) * 0.8;
			this.vliegSnelheid = mod.snelheidMix(0.25, 4, iter);
			this.rotatie = -0.5 + Number((Math.random() * 4).toFixed(2));
			this.draaiing = 0;//2 + Number((Math.random() * 4).toFixed(2));
		};
	},

	//pakkers en zetters..niet uitgewerkt
	p: function(a){
		return this[a];
	},
	z: function(a, b){
		this[a] = b;
	},



	//layout

	pakAantalKolommen: function (){

		var bg = (mod.p('posities')).bezetGebied;
		return (bg.l.filter( mod.onlyUnique )).length;

	},

	bepaalRatios: function (st){

		var r = st.imgs.ratios;

		//eerst simpel gemiddelde berekenen
		var cum = r.reduce(function(vorige, huidige, index, array){
			return vorige + huidige;
		});
		var gem = cum / mod.p('afbsLength');

		//standaarddeviatie berekenen
		var afwijkingCum = r.reduce(function(vorige, huidige, index, array){
			return Math.pow(Math.pow(huidige - gem, 2), 0.5);
		});

		var stdDev = afwijkingCum / mod.p('afbsLength');

		//nieuw gemiddelde berekenen zonder buitenbeentjes erbij
		var cumNaStd = 0, deler = 0;
		for (i = 0; i < mod.p('afbsLength'); i++) {
			if (r[i] - gem < (stdDev * 2.5)) {
				cumNaStd += r[i];
				deler++;
			}
		}

		//dit is het gemiddelde nadat de buitenbeentjes verwijderd zijn.
		this.gemNaStd = cumNaStd / deler;

		this.huiFormaat.b = this.huiFormaat.h * this.gemNaStd;

	},

	bepaalRichting: function (ditBlok, hypWind, st){

		var
		hypPos = new mod.nwePos(hypWind, ditBlok),
		passeer = true,
		overlappen = [],
		richtlet,
		r = st.ld.richting,
		bg = st.pos.bezetGebied,
		p = st.m.patroon,
		iter = st.ld.iter;

		//BEREKENDE METHODE: ZIE ONDERAAN DOCUMENT.

		//PATROON METHODE
		if (p[iter]) {
			return  r[st.m.huiRichPlus()];
		} else {
			return  r[  (st.ld['huiRich'])  ];
		}

	},

	huiRichPlus: function (){
		var hr = (this.p('layDat'))['huiRich'];
		hr += 1;
		if (hr > 3) hr = 0;
		this.layDat.huiRich = hr;
		return hr;
	},

	nwePos: function(rich, blok){


		var
		_m = mod,
		pos = _m.p('posities'),
		l = pos['laatstePos'],
		m = (_m.p('layDat')).opmaak.marge,
		bd = _m.huiFormaat.pak(),
		b = bd.b,
		h = bd.h;

		switch(rich) {

			case 't':
				this.t = l.t - (h + m);
				this.r = l.r;
				this.b = l.b + (h + m);
				this.l = l.l;
			break;

			case 'r':
				this.t = l.t;
				this.r = l.r - (b + m);
				this.b = l.b;
				this.l = l.l + (b + m);
			break;

			case 'b':
				this.t = l.t + (h + m);
				this.r = l.r;
				this.b = l.b - (h + m);
				this.l = l.l;
			break;

			case 'l':
				this.t = l.t;
				this.r = l.r + (b + m);
				this.b = l.b;
				this.l = l.l - (b + m);
			break;

		}

	},

	maakRijPos: function(){

		var
		rp = this.rijPrinten,
		onderkant = rp.onderkant(),
		linkerMarge = rp.linkerMarge(),
		blokDim = mod.huiFormaat.pak(),
		o = this.layDat.opmaak,
		inRijLinksGeprint = rp.kol * (blokDim.b + o.marge),
		dezePos = {
			t: onderkant + o.marge,
			r: linkerMarge + inRijLinksGeprint + blokDim.b,
			b: onderkant + o.marge + blokDim.h,
			l: linkerMarge + inRijLinksGeprint,
			isRij: true,
		},
		rijData;

		if (rp.kolNaarRij()) {
			rijData = mod.layDat.rijAantal.rekenRecht();
		}
		return {
			dezePos: dezePos,
			rijData: rijData,
		};
	},

	registreerEerstePos: function(eersteBlok){

		this.posities.nweLaatstePos({
			t: gr.geenPx(eersteBlok.el.style.top),
			r: gr.geenPx(eersteBlok.el.style.left) + eersteBlok.el.clientWidth,
			b: gr.geenPx(eersteBlok.el.style.top) + eersteBlok.el.clientHeight,
			l: gr.geenPx(eersteBlok.el.style.left)
		});

	},

	kolommenCalc: function (){

		//alleen de afbeeldingen die op het scherm passen kunnen met de animatie. De rest moet er 'gewoon' achteraan geprint worden.
		var o = mod.layDat.opmaak;
		var hf = mod.huiFormaat.pak();
		o.maxKolommen = Math.floor((mod.p('houder')).clientWidth / (hf.b + 2 * o.marge)  );
		o.maxRijen = o.maxKolommen; //fix

		o.maxCirculair = Math.floor(o.maxKolommen * o.maxRijen);

		this.totaalKolommen = (Math.ceil(Math.sqrt((this.afbsLength))));
		this.totaalKolommen = (this.totaalKolommen > o.maxKolommen ? o.maxKolommen : this.totaalKolommen);

		//top comp 1e afb

		//verspringing bij wortel van oppervlak oneven integers min n schillen.

		//aantal schillen: 	   1  3  5   7   9   11   13   15
		var verspringAantal = [1, 7, 21, 43, 73, 121, 157, 211];
		var tegelHoogtesOmlaag;

		//als er rijen geprint worden dan veranderd startTop niet verder. De stap naar rijen vindt plaats op de kwadraten van maxKolommen. Even is irrelevant.
		for (var i = 0; i < verspringAantal.length; i++) {

			//aantal tegels mag niet hoger worden dan limieten.
			if (verspringAantal[i] > mod.afbsLength) {
				break;
			}
			//aantal schillen kan ook niet hoger zijn dan maxKolommen.
			if ((2*i + 1) > o.maxKolommen) {
				break;
			}

			//tegelHoogtesOmlaag = -1 * i;
			tegelHoogtesOmlaag = i;

		}

		this.startTop = (tegelHoogtesOmlaag * hf.h * o.scale) + o.marge;


		//na welke afb versnelling in delen
		mod.netPrintLim = Math.pow(this.totaalKolommen, 2) + this.totaalKolommen;

	},

	rijOrdening: function(){

		var bg = (mod.p('posities')).bezetGebied;
		var linksPosities = bg.l.filter( gr.onlyUnique );
		var bovenPosities = bg.t.filter( gr.onlyUnique );

		var rijen = [];

		//rijen vullen met lege arrays
		for  (var i = 0; i < bovenPosities.length; i++) {
			rijen.push([]);
		}

		var dezeTop, isInRij;

		//door blokken heenlopen en in rijen indelen
		for (i = 0; i < bg.blokken.length; i++) {
			dezeTop = bg.blokken[i].t;
			isInRij = bovenPosities.indexOf(dezeTop);
			rijen[isInRij].push(i);
		}

		//door rijen heenlopen en sorteren
		for (i = 0; i < rijen; i++) {

		}

		//unieke bovenposities bepalen

		//unieke linksposities bepalen

		//door blokken heen loopen en rijen construeren

		//door rijen heen loopen en sorteren.

	},

	snelheidMix: function (b, d, iter){

		var f;

		if (iter) {
			f = 1 + iter / 30;
		} else {
			f = 1;
		}

		var
		r = (Math.random() / d),
		s = ((b + r) * f).toFixed(2);

		return s + 's';
	},

	klokTijd: function(i){

		if (i < mod.netPrintLim) {
			var vt = 400 - (this.afbsLength * 10);
			vt = (vt > 150 ? vt : 150);
			return vt * i + (Math.random() * 300);
		} else {
			return (mod.netPrintLim + 2) * i + 300;
		}

	},

	blokInBezetGebied: function(){

		var p = this.posities;

		for (var richting in p['laatstePos']) {
			//niet alle 'richtingen' zijn daadwerkelijke richtingen.
			if (richting.length > 1) continue;
			p.bezetGebied[richting].push(p['laatstePos'][richting]);
		}

		p.bezetGebied.blokken.push(p['laatstePos']);

	},

	zijnWeKlaar: function(){
		return this.layDat.iter == this.afbsLength;
	}

}; //eind mod





////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

// VIEW

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////


var view = {

	scrollTo: function (to, duration) {
		if (duration < 0) return;
		var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
		var difference = to - scrollTop;
		var perTick = difference / duration * 20;

		setTimeout(function() {
			scrollTop = scrollTop + perTick;
			document.body.scrollTop = scrollTop;
			document.documentElement.scrollTop = scrollTop;
			if (scrollTop === to) return;
			view.scrollTo(to, duration - 20);
		}, 20);
	},

	// AFBEELDINGEN ER IN ZETTEN.
	zetAfb: function(afbs){

		//bijschalen voor later overlap effect
		var al = afbs.length;
		var scale = mod.layDat.opmaak.scale;
		for (i = 0; i < al; i++) {

			var img = document.createElement('img');
			var ditEl = afbs[i].el;

			//er zijn voor nu maar 40 afbeeldingen.
			//img.src = 'afbeeldingen/' + (i%40 +1) + '.jpg'; //uit concept nog

			img.src = ditEl.getAttribute('data-src');
			img.alt = ditEl.getAttribute('data-alt');
			img.title = ditEl.getAttribute('data-title-vol');

			//moet naar een model.
			if (img.naturalWidth) { //uit cache
				img.width = img.naturalWidth / scale;
				img.height = img.naturalHeight / scale;
			} else {
				var ar = img.src.split('-');
				var dims = ar[(ar.length - 1)].replace('.jpg','');
				var dimsAr = dims.split('x');
				img.width = Number(dimsAr[0]) / scale;
				img.height = Number(dimsAr[1]) / scale;
			}


			img.addEventListener('load', function(){

				ctrl.imgKlaar(this);

			});

			var span = document.createElement('span');
			var spanTekst = document.createTextNode(img.title);
			span.appendChild(spanTekst);

			var dezeAfbBinnen = ditEl.querySelectorAll('.afb-binnen')[0];
			dezeAfbBinnen.appendChild(img);
			dezeAfbBinnen.appendChild(span);

		}

	},

	pasRatiosToe: function (st, afbsH, ratio){

		var
		al = st.afbs.length,
		wStr = gr.metPx(afbsH * ratio);

		for (i = 0; i < al; i++) {
			st.afbs[i].el.style.width = wStr;
		}

	},

	voorGooiStijl: function(blok, iter, o){
		gr.stijl(blok.el, {
			zIndex: iter,
			transform: " scale("+o.scale+", "+o.scale+") skew("+blok.draaiing+"deg)",
			WebkitTransform: " scale("+o.scale+", "+o.scale+") skew("+blok.draaiing+"deg)",
			MSTransform: " scale("+o.scale+", "+o.scale+") skew("+blok.draaiing+"deg)",
			transition: blok.vliegSnelheid+" left cubic-bezier(0.17, 0.84, 0.44, 1) 0.2s, "+blok.vliegSnelheid+" top cubic-bezier(0.17, 0.84, 0.44, 1) 0.2s, 0.3s scale ease-out 0.2s, 0.4s transform linear 0.2s, 0.2s box-shadow linear 0.2s, 0.25s opacity 0.2s",
		});
	},

	laderWeg: function(){
		mod.houder.removeChild(document.getElementById('laadboodschap'));
	},

	tegelhouderHoogte: function(rijen){

		var l = mod.layDat, o = l.opmaak;
		var h = (rijen * o.marge) + (rijen * (mod.huiFormaat.pak()).h);
		mod.houder.style.height = gr.metPx(h);

	},

	afronding: function (st, huiFor, houder){

		//hoogte afbeeldingengroep naar inhoud zetten

		var
		bg = st.pos.bezetGebied,
		hoogstePunt = Math.min.apply(Math, bg.t),
		laagstePunt = Math.max.apply(Math, bg.t);
		//hoogteAfbGroep = hoogstePunt + laagstePunt + 150 + huiFor.h;

		houder.className = houder.className + ' klaar';

	},

	muisInit: function (){

		var th = mod.p('houder');
		th.addEventListener('click', function(e){

			console.log(e);

			//project tonen, als lazy, dan ontlazy.
			var tar = e.target;

			//geklikt op link menu?
			if (tar.hasAttribute('href')) {
				return;
			}

			//alle eerdere projecten verstoppen
			var tps = document.getElementsByClassName('tegel-projecten');
			for (var i = 0; i < tps.length; i++) {
				tps[i].style.display = "none";
			}

			if (tar.nodeName === 'SPAN' || tar.nodeName === 'IMG') {
				while(!tar.hasAttribute('data-post-id')) {
					tar = tar.parentNode;
				}
				view.tegelKlik(tar.getAttribute('data-post-id'));
				!mod.houder.classList.contains('projecten-open') && mod.houder.classList.add('projecten-open');

			} else {
				view.scrollHouder();
				mod.houder.classList.remove('projecten-open');
			}

		});

	},

	tegelKlik: function(id){

		var
		projArt = document.getElementById('proj-'+id),
		projInh = projArt.getElementsByClassName('proj-inh')[0],
		projImgDiv = projArt.getElementsByClassName('proj-img')[0],
		dezeLazy = projInh.getAttribute('data-lazy'),
		img, img2;

		if (dezeLazy) {

			//loader erin zetten
			var laadDiv = document.createElement('div');
			laadDiv.className = 'loader';
			projImgDiv.appendChild(laadDiv);

			img = new Image();
			img.addEventListener('load', function(){
				projImgDiv.classList.add('img-geladen');
				projImgDiv.removeChild(laadDiv);
				projImgDiv.appendChild(img);

				if (projInh.hasAttribute('data-extra-afb')) {

					var extraSrc = projInh.getAttribute('data-extra-afb');

					img2 = new Image();
					img2.addEventListener('load', function(){
						projImgDiv.appendChild(img2);
						projImgDiv.classList.add('extra-afb');
					});

					img2.addEventListener('error', function(){
						img2.src = img2.src.replace('-1000x2500.jpg', '.jpg');
					});

					img2.src = extraSrc;
					projInh.removeAttribute('data-extra-afb');
				}

			});

			img.addEventListener('error', function(){
				//proberen met mogelijke andere src?
				img.src = img.src.replace('-1000x2500.jpg', '.jpg');
			});

			img.src = dezeLazy;
			projInh.setAttribute('data-lazy', '');
			projArt.style.display = 'block';

		} else {
			//niet lazy, toon;
			projArt.style.display = "block";
		}

		document.getElementById('projecten').getElementsByTagName('header')[0].style.display = "none";

		setTimeout(function(){
			view.scrollTo(document.getElementById('werk-paginabreed').offsetTop + 30, 250);
		}, 150);

	},

	scrollHouder: function(){

		document.getElementById('projecten').getElementsByTagName('header')[0].style.display = "block";

		setTimeout(function(){
			view.scrollTo(document.getElementById('werk-paginabreed').offsetTop + 30, 250);
		}, 150);

	},

	corrigeerEersteBlok: function(blok){

		//correctie naar links voor even aantal kolommen
		var cor = (mod.totaalKolommen%2 === 0 ? blok.el.clientWidth / 2 : 0);
		blok.el.style.left = ((mod.afbGroep.clientWidth / 2) - (blok.el.clientWidth / 2)) - cor + 'px';

		//correctie voor boven blad uitkomen
		blok.el.style.top = gr.metPx(mod.startTop);

		return blok;
	},

	naGooiStijl: function(blok){
		blok.el.style.opacity = "1";
		blok.el.className = blok.el.className + ' getoond';
	}

};


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

//CONTROLLER

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////


var ctrl = {
	init: function(){

		mod.init();

		this.st = mod.snelToegang();  //standaard variabelen voor functies

		view.zetAfb(this.st.afbs);

	},

	imgKlaar: function(img){

		mod.imgData.slaImgOp(img);

		if (mod.imgData.naLaden()) {

			ctrl.bewerkSequentie();
		}
	},

	bewerkSequentie: function () {

		mod.bepaalRatios(this.st);

		view.pasRatiosToe(this.st, (mod.huiFormaat.pak()).h, mod.p('gemNaStd'));

		mod.kolommenCalc();

		this.gooiKlok();

	},

	gooiKlok: function (){

		var
		_this = this,
		al = mod.afbsLength,
		t;

		//wachten tot gescrolld naar gebied met afbeeldingen.
		var wachtOpScroll = setInterval(function(){
			if (mod.houder.className.indexOf('mag-beginnen') !== -1) {
				clearInterval(wachtOpScroll);
				for (i = 0; i < al; i++) {

					t = mod.klokTijd(i);

					setTimeout(function(){

						if (_this.gooi(_this.st)) { //gooi geeft true als klaar
							_this.naLaatsteTegel();
						}

					}, t);
				}
			}
		}, 100);

	},

	gooi: function (st){

		if (!st.m.p('draait')) {
			st.m.z('draait', true);
			view.laderWeg();
		}

		var
		iter = st.ld.iter,
		ditBlok = st.afbs[iter],
		r = st.ld.richting,
		hypWind = st.ld.hypWind(r),
		bg = st.pos['bezetGebied'],
		bgl = bg.blokken.length,
		o = st.ld.opmaak,
		rijData;

		ditBlok.iter = iter;
		ditBlok.maakStijlen();

		view.voorGooiStijl(ditBlok, iter, o);

		if (bgl) {

			var dezePos;

			if (iter < o.maxCirculair) { //we mogen nog in rondjes.

				//eerst testen of de bocht om kan.
				var richtLet = st.m.bepaalRichting(ditBlok, hypWind, st);
				dezePos = new mod.nwePos(richtLet, ditBlok);
				rijData = mod.layDat.rijAantal.rekenCirkel(iter);

			} else { //we mogen géén rondjes meer, onderop printen.

				var ret = st.m.maakRijPos();
				dezePos = ret.dezePos;
				rijData = ret.rijData || 0;

			}

			st.pos.nweLaatstePos(dezePos);
			ditBlok.plaats(dezePos);


		} else { // if niet bgl, dus eerste

			ditBlok = view.corrigeerEersteBlok(ditBlok);
			rijData = mod.layDat.rijAantal.rekenCirkel(iter);
			mod.registreerEerstePos(ditBlok);

		}

		//hoogte omvattend blok bijwerken?
		if (rijData && rijData.verschuif) {
			view.tegelhouderHoogte(rijData.huiRijen);
		}

		mod.blokInBezetGebied();

		view.naGooiStijl(ditBlok);

		mod.layDat.werkIterBij();

		//naar afronding na laatste afbeelding.
		return mod.zijnWeKlaar();

	},

	naLaatsteTegel: function(){
		view.afronding(this.st, mod.huiFormaat.pak(), mod.p('houder'));
		mod.bepaalRijPatroon();
		view.muisInit();
	}

};

//HATSJÉ
window.onload = function(){
	ctrl.init();
};

var windowWI = window.innerWidth;

if (windowWI > 900) {
	var resizeInterval = setInterval(function(){
		if (windowWI !== window.innerWidth) {
			clearInterval(resizeInterval);
			location.reload();
		}
	}, 500);
}


//vullen met nullen

//BEREKENDE METHODE. BUGT. SOMS 4E POSITIE NIET 'OP TIJD' BEREKEND, GEEFT BOCHT WAAR RECHTDOOR MOET.


//BEREKENDE PATROON METHODE
/*		for (i = 0; i < bg.blokken.length; i++) {
			overlappen[i] = 0;
		}

		for (var hWind in hypPos) { //loop door trbl

			var
			maxWindRich = st.ld.vglMat[hWind][0],
			minWindRich = st.ld.vglMat[hWind][1];

			for (i = 0; i < bg.blokken.length; i++) {

			//voor iedere windrichting door alleblokken of 't ergens tussen ligt.

				var refBlok = bg.blokken[i];

				if (hypPos[hWind] <= refBlok[maxWindRich] && hypPos[hWind] >= refBlok[maxWindRich] ) {

					//valt ie er tussen? zet dan +1 op die index in overlappen
					overlappen[i] += 1;

				}

			}
		}


		//voor trbl van hypPos, als tussen die en die waarde van àlle eerdere blokken
		//als méér dan één ertussen, dan rechtdoor

		if (!(overlappen.indexOf(2)+1)) { //DE BOCHT OM
			console.log(mod.layDat.iter + ' bocht');
			return  r[st.m.huiRichPlus()];
		} else { //RECHTDOOR
			console.log(mod.layDat.iter + ' rechtdoor');
			return  r[  (st.ld['huiRich'])  ];
		}*/