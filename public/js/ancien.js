class Quiz {

    constructor(verbs) {
        this.score = { success : 0, error : 0 };
        this.verb = null;
        this.conjugaison = null;
        this.verbs = verbs;
        this.inputForm = $('#form'), this.input = this.inputForm.find('input');
        this.verbEl = $('#verb');
        this.kanjiEl = $('#kanji');
        this.conjugaisonEL = $('#conjugaison');
        this.successEl = $('#success');
        this.errorEl = $('#error');
        this.initInput();
        this.delay = 1000;
        this.disabled = false;
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
        this.conjugaison = this.verb.forms[ Math.floor( Math.random() * this.verb.forms.length ) ];
    }

    displayVerb(result = false) {
        this.kanjiEl.text( this.verb.kanji );
        this.verbEl.text( result ? this.conjugaison.value : this.verb.dictionnary );
        this.conjugaisonEL.text( this.conjugaison.label + " form" );
    }

    checkAnswer() {
        var self = this;
        var answer = this.input.val();
        answer == this.conjugaison.value ? this.success() : this.error();
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

    constructor(kanji, dictionnary, negative, polite, conditional, imperative, volitional) {
        this.kanji = kanji;
        this.dictionnary = wanakana.toKana(dictionnary);
        this.forms = [
            { label : 'negative',       value : wanakana.toKana(negative) },
            { label : 'polite',         value : wanakana.toKana(polite) },
            { label : 'conditional',    value : wanakana.toKana(conditional) },
            { label : 'imperative',     value : wanakana.toKana(imperative) },
            { label : 'volitional',     value : wanakana.toKana(volitional) },
        ]
    }

}

$(function() {

    var verbs = [
        new Verb('見る', 'miru', 'minai', 'mimasu', 'mireba', 'miro', 'miyou'),
        new Verb('買う', 'kau', 'kawanai', 'kaimasu', 'kaeba', 'kae', 'kaou'),
        new Verb('行く', 'iku', 'ikanai', 'ikimasu', 'ikeba', 'ike', 'ikou'),
        new Verb('起きる', 'okiru', 'okinai', 'okimasu', 'okireba', 'okiro', 'okiyou'),
    ]

    var quiz = new Quiz(verbs);

    quiz.generate();

    var morpho = new(JsLingua.getService("Morpho", 'jpn'))();
    
    var verb = '見る';

    var forms = morpho.getForms();
    var type = morpho.getVerbType(verb);

    console.log(forms);
    console.log( morpho.conjugate(verb,{ vtype: type, tense : 'present', formality : 'polite' }) );

});