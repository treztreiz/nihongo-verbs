class Quiz {

    constructor(verbs) {

        this.score = { success : 0, error : 0 };
        this.verb = null;
        this.conjugaison = null;
        this.answer = null;
        this.audio = null;
        this.negated = false;
        this.verbs = verbs;

        this.inputForm = $('#form');
        this.input = $('#answer');
        this.typeEl = $('#type');
        this.verbEl = $('#verb');
        this.kanjiEl = $('#kanji');
        this.tenseEl = $('#tense');
        this.posEl = $('#pos');
        this.formalityEL = $('#formality');
        this.successEl = $('#success');
        this.errorEl = $('#error');
        this.studyEl = $('#study');
        this.definitionEl = $('#definition');
        this.continueEl = $('#continue');
        this.speakEl = $('#speak');
        this.awardEl = $('#award');

        this.settingsFormalityEl = $('input[type="radio"][name="formality"]');
        this.settingsNegationEl = $('input[type="radio"][name="negation"]');
        this.settingsTenseEl = $('input[type="checkbox"][data-tense]');

        this.formalities = ['plain', 'polite'];
        this.formalitySettings = 0;

        this.negationSettings = 0;

        this.initInput();
        this.initContinue();
        this.initSpeak();
        this.initFormality();
        this.initNegation();

        this.delay = 3000;
        this.speakDelay = 0;
        this.disabled = false;

        this.morpho = new(JsLingua.getService("Morpho", 'jpn'))();
        
        this.tense = null;
        this.formality = null;
        this.type = null;

        this.forms = this.morpho.getForms();
        console.log( this.morpho.getForms() );

        this.tenseSettings = [ 'pres', 'past', 'vol' ];
        this.initTense();

        this.toAnimate = [];
        
        this.timer = null;
        this.time = 0;
        this.maxTime = 20000;
        this.timerEl = $('.progress .determinate');

    }

    startTimer() {
        var self = this;
        this.timer = setInterval( function(){
            self.time += 10;
            var width = Math.floor(self.time / self.maxTime * 100);
            self.timerEl.css('width', width + '%');
            if( self.time >= self.maxTime ) self.checkAnswer();
        }, 10 );
    }

    clearTimer() {
        clearInterval( this.timer );
        this.time = 0;
        this.timerEl.css('width', 0);
    }

    getFormalities() {
        return this.formalitySettings ? [ this.formalities[this.formalitySettings - 1] ] : this.formalities;
    }

    getNegation() {
        switch( this.negationSettings ) {
            case 2 : return true;
            case 1 : return false;
            default : return Math.floor( Math.random() * 2 );
        }
    }

    initFormality() {
        var self = this;
        this.settingsFormalityEl.change(function(){
            self.formalitySettings = parseInt( $(this).data('formality') );
        });
    }

    initNegation() {
        var self = this;
        this.settingsNegationEl.change(function(){
            self.negationSettings = parseInt( $(this).data('negation') );
        });
    }

    initTense() {
        var self = this;
        this.settingsTenseEl.change(function() {

            var checked = $(this).prop('checked');
            var tense = $(this).data('tense');
            var settings = self.tenseSettings;
            var index = settings.indexOf(tense);

            if( checked && index === -1 ) settings.push( tense );
            else if( !checked && index !== -1 ) settings.splice( index, 1);

        });
    }

    initInput() {
        var self = this;
        wanakana.bind(this.input[0]);
        this.inputForm.on('submit', function(e) {
            e.preventDefault();
            if( self.disabled ) return;
            self.checkAnswer();
        });
    }

    initContinue() {
        var self = this;
        this.continueEl.find('button').on('click', function() {
            $(this).parent().css('opacity', 0).removeClass('empty-input');
            self.input.attr('disabled', false);
            self.input.focus();
            if( self.disabled ) self.generate();
        });
    }

    initSpeak() {
        var self = this;
        this.speakEl.on('click', () => self.speak());
    }

    generate() {
        this.disabled = false;
        this.verbEl.attr('data-status', null);
        this.kanjiEl.attr('data-status', null);
        this.definitionEl.attr('data-status', null);
        this.typeEl.attr('data-status', null);
        this.generateVerb();
        this.displayVerb();
    }

    generateVerb() {
        
        var verb = this.verbs[ Math.floor( Math.random() * this.verbs.length ) ];
        //if( verb === this.verb ) return this.generateVerb();
        this.verb = verb;

        // BUG TYPE CORRECTION
        // switch(verb.romaji) {
        //     // case 'dekakeru' :
        //     // case 'okiru' : this.type = 'ichidan'; break;
        //     default : this.type = this.morpho.getVerbType(verb.kanji);
        // }

        this.type = this.morpho.getVerbType(verb.kanji);

        var keys = this.tenseSettings.length ? this.tenseSettings : Object.keys(this.forms);
        var key = keys[ Math.floor( Math.random() * keys.length ) ]; 
        var conj = this.forms[ key ];

        this.tense = 'tense' in conj ? conj.tense : conj.mood;

        if( this.tense == 'optative' ) this.tense = 'volitional';

        key == 'prov' ? this.formality = 'plain' : this.formality = this.getFormalities()[ Math.floor( Math.random() * this.getFormalities().length ) ];
        this.negated = key == 'vol' ? false : this.getNegation();

        var params = { vtype: this.type, formality : this.formality, negated : this.negated, ...conj };
        this.answer = this.morpho.conjugate(verb.kanji, params);

        this.audio = this.verb.kana;

        this.getDefinition();
        this.convertKanji();

        var self = this;
        setTimeout( () => self.speak(), this.speakDelay );

        this.startTimer();
        
    }

    speak() {
        var self = this;
        responsiveVoice.speak( this.audio, "Japanese Female", {
            pitch : 1,
            onstart : () => {
                self.kanjiEl.addClass('speaking');
                if( self.toAnimate.length ) {
                    for( var i = 0; i < self.toAnimate.length; i++ ){
                        self.toAnimate[i].addClass('zoomed');
                    }
                }
            },
            onend : () => {
                if( self.toAnimate.length ) {
                    for( var i = 0; i < self.toAnimate.length; i++ ){
                        self.toAnimate[i].removeClass('zoomed');
                    }    
                    self.toAnimate = [];
                }
                self.kanjiEl.removeClass('speaking');
                self.input.focus();
            },
        });
    }

    getDefinition() {
        var self = this;
        self.definitionEl.text('');
        $.post(Routing.generate('info', { verb: this.verb.kanji }), data => {
            var definitions = data.data[0].senses[0].english_definitions;
            self.definitionEl.append('" ');
            for( var i = 0; i < definitions.length; i++) {
                self.definitionEl.append(definitions[i]);
                if( i < definitions.length - 1 ) self.definitionEl.append(', ');
            }
            self.definitionEl.append(' "');
        }).fail( err => console.error(err) );
    }

    convertKanji() {
        var self = this;
        this.disabled = true;
        var kuroshiro = new Kuroshiro();
        kuroshiro.init(new KuromojiAnalyzer())
        .then(function () {
            return kuroshiro.convert(self.answer, { to: "hiragana" });
        })
        .then(function(result){
            self.conjugaison = result;
            self.disabled = false;
        });
    }

    displayVerb(result = false) {

        if( !result ) this.input.val("");
        this.kanjiEl.text( result ? this.answer : this.verb.kanji );
        this.verbEl.text( result ? this.conjugaison : this.verb.kana );
        this.typeEl.text(this.type + ' verb');
        //this.studyEl.attr('href', 'http://japaneseverbconjugator.com/VerbDetails.asp?txtVerb=' + this.verb.kanji + '&Go=Conjugate');
        this.studyEl.attr('href', 'https://conjugueur.reverso.net/conjugaison-japonais-verbe-' + this.verb.kanji + '.html');

        var self = this;
        setTimeout( function(){

            var icon;

            // Tense
            icon = self.tenseEl.find('i');
            if( !icon.length || icon.data('current-tense') != self.tense ) {
                self.tenseEl.html( '<i class="material-icons" data-current-tense="' + self.tense + '">access_time</i>' + self.tense.toLowerCase() );
                self.toAnimate.push( self.tenseEl.find('i') );
                // self.animateIcon( self.tenseEl.find('i') );
            }

            // Negation
            icon = self.posEl.find('i');
            if( !icon.length || self.negated && !icon.hasClass('neg') || !self.negated && !icon.hasClass('pos') ) {
                self.posEl.html( self.negated ? '<i class="material-icons neg">thumb_down</i> negative' : '<i class="material-icons pos">thumb_up</i> positive' );
                //self.animateIcon( self.posEl.find('i') );
                self.toAnimate.push( self.posEl.find('i') );
            }

            // Formality
            icon = self.formalityEL.find('i');
            if( !icon.length || self.formality == 'polite' && !icon.hasClass('pos') || self.formality != 'polite' && !icon.hasClass('neg') ) {
                self.formality == 'polite' ? self.formalityEL.html('<i class="material-icons pos">sms</i>') : self.formalityEL.html('<i class="material-icons neg">sms_failed</i>');
                self.formalityEL.append( self.formality );
                //self.animateIcon( self.formalityEL.find('i') );
                self.toAnimate.push( self.formalityEL.find('i') );
            }

        }, 500 );
        
    }

    animateIcon(icon, delay = 0) {
        setTimeout( () => {
            icon.addClass('zoomed');
            setTimeout( () => icon.removeClass('zoomed'), 600 );
        }, delay );
    }

    checkAnswer() {

        this.clearTimer();

        var answer = this.input.val();
        var regex = new RegExp('^' + this.conjugaison.replace(/\//g, '|') + '$');
        regex.exec(answer.replace(/n/g, 'ん')) !== null ? this.success() : this.error();
        this.displayVerb(true);
        this.disabled = true;

        if( this.conjugaison.indexOf('/') !== -1 ) {
            var stem = this.conjugaison.split('(')[0];
            var conjugations = this.conjugaison.split('(')[1].replace(/\)/g, '').split('/');
            var audio = "";
            for( var i = 0; i < conjugations.length; i++) {
                audio += stem + conjugations[i];
                if( i < conjugations.length - 1 ) audio += ", ";
            }
            this.audio = audio;
        } else {
            this.audio = this.conjugaison;
        }

        var self = this;
        setTimeout( () => self.speak(), this.speakDelay );
    }

    success() {
        this.animateAward();
        this.verbEl.attr('data-status', 'success');
        this.kanjiEl.attr('data-status', 'success');
        this.definitionEl.attr('data-status', 'success');
        this.typeEl.attr('data-status', 'success');
        this.score.success ++;
        this.successEl.text( this.score.success );
        this.input.val("");
        var self = this;
        setTimeout( () => self.generate(), this.delay);
    }

    animateAward() {
        var award = this.awardEl;
        award.fadeIn(400, function(){
            setTimeout( () => award.fadeOut(400, () => award.removeClass('animated') ), 1000 );
        }).addClass('animated');
    }

    error() {
        this.verbEl.attr('data-status', 'error');
        this.kanjiEl.attr('data-status', 'error');
        this.definitionEl.attr('data-status', 'error');
        this.typeEl.attr('data-status', 'error');
        this.score.error ++;
        this.errorEl.text( this.score.error );
        this.input.attr('disabled',true);
        this.continueEl.css('opacity', 1).find('button').focus();
        if( this.input.val() == "" ) this.continueEl.addClass('empty-input');
    }

}

class Verb {

    constructor(kanji, romaji) {
        this.kanji = kanji;
        this.romaji = romaji;
        this.kana = wanakana.toKana(romaji);
    }

}

$(function() {

    M.AutoInit();

    var verbs = [
        new Verb('見る', 'miru'),
        new Verb('買う', 'kau'),
        new Verb('行く', 'iku'),
        new Verb('起きる', 'okiru'),
        // new Verb('切る', 'kiru'),
        new Verb('来る','kuru'),
        new Verb('集める','atsumeru'),
        new Verb('食べる', 'taberu'),
        new Verb('飲む', 'nomu'),
        new Verb('出かける', 'dekakeru'),
        // new Verb('起こす','okosu'),
        // new Verb('構える','kamaeru'),
        new Verb('練る','neru'),
        new Verb('寝る','neru'),
        // new Verb('蹴る','keru'),
        new Verb('勉強する', 'benkyousuru')
    ];

    var quiz = new Quiz(verbs);

    quiz.generate();

    $('#settings-furigana').change(function(){
        var furigana = $('#verb');
        $(this).prop('checked') ? furigana.addClass('disabled') : furigana.removeClass('disabled'); 
    });

    $('#settings-type').change(function(){
        var type = $('#type');
        $(this).prop('checked') ? type.addClass('disabled') : type.removeClass('disabled'); 
    });

    $('#settings-definition').change(function(){
        var def = $('#definition');
        $(this).prop('checked') ? def.addClass('disabled') : def.removeClass('disabled'); 
    });

    $('#answer').focus();

});