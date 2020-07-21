class Quiz {

    constructor(verbs) {

        this.score = { success : 0, error : 0 };
        this.verb = null;
        this.conjugaison = null;
        this.verbs = verbs;
        this.inputForm = $('#form'), this.input = this.inputForm.find('input');

        this.typeEl = $('#type');
        this.verbEl = $('#verb');
        this.kanjiEl = $('#kanji');
        this.tenseEl = $('#tense');
        this.formalityEL = $('#formality');
        this.successEl = $('#success');
        this.errorEl = $('#error');

        this.initInput();
        this.delay = 1500;
        this.disabled = false;

        this.morpho = new(JsLingua.getService("Morpho", 'jpn'))();
        
        this.tense = null;
        this.formality = null;
        this.type = null;

        this.forms = this.morpho.getForms();
        console.log(this.forms);

        delete this.forms['cond'];
        delete this.forms['caus'];
        delete this.forms['pot'];
        //delete this.forms['prov'];
        delete this.forms['caus_pass'];
        delete this.forms['pass'];
        delete this.forms['past_cont'];
        delete this.forms['pres_cont'];

        console.log( this.forms );

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

    generate() {
        this.verbEl.attr('data-status', null);
        this.generateVerb();
        this.displayVerb();
    }

    generateVerb() {

        var verb = this.verbs[ Math.floor( Math.random() * this.verbs.length ) ];
        if( verb === this.verb ) return this.generateVerb();
        this.verb = verb;

        // BUG TYPE CORRECTION
        switch(verb.romaji) {
            case 'okiru' : this.type = 'ichidan'; break;
            default : this.type = this.morpho.getVerbType(verb.kana);
        }

        var keys = Object.keys(this.forms);
        var key = keys[ Math.floor( Math.random() * keys.length ) ];
        var conj = this.forms[ key ];
        this.tense = conj.desc;

        var formalities = ['plain', 'polite'];
        key == 'prov' ? this.formality = 'plain' : this.formality = formalities[ Math.floor( Math.random() * formalities.length ) ];

        var params = { vtype: this.type, formality : this.formality, ...conj };
        this.conjugaison = this.morpho.conjugate(verb.kana, params);

        if( this.formality == 'polite' ) this.convertKanji();
        else console.log( this.conjugaison );
        
    }

    convertKanji() {
        var self = this;
        var kuroshiro = new Kuroshiro();
        kuroshiro.init(new KuromojiAnalyzer())
        .then(function () {
            return kuroshiro.convert(self.conjugaison, { to: "hiragana" });
        })
        .then(function(result){
            self.conjugaison =  result;
            console.log( self.conjugaison );
        });
    }

    displayVerb(result = false) {
        this.kanjiEl.text( this.verb.kanji );
        this.verbEl.text( result ? this.conjugaison : this.verb.kana );
        this.tenseEl.text( this.tense.toLowerCase() );
        this.formalityEL.text( this.formality );
        this.typeEl.text(this.type);
    }

    checkAnswer() {
        var self = this;
        var answer = this.input.val();
        answer == this.conjugaison ? this.success() : this.error();
        this.input.val("");
        this.displayVerb(true);
        this.disabled = true;
        setTimeout(function() {
            self.disabled = false;
            self.generate();
        }, this.delay);
    }

    success() {
        this.verbEl.attr('data-status', 'success');
        this.score.success ++;
        this.successEl.text( this.score.success );
    }

    error() {
        this.verbEl.attr('data-status', 'error');
        this.score.error ++;
        this.errorEl.text( this.score.error );
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

    var verbs = [
        new Verb('見る', 'miru'),
        new Verb('買う', 'kau'),
        new Verb('行く', 'iku'),
        new Verb('起きる', 'okiru'),
        new Verb('来る','kuru'),
        new Verb('集める','atsumeru')
    ]

    var quiz = new Quiz(verbs);

    quiz.generate();

});