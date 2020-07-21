class Quiz {

    constructor(verbs) {
        this.score = { success : 0, error : 0 };
        this.verb = null;
        this.conjugaison = null;
        this.verbs = verbs;
        this.inputForm = $('#form'), this.input = this.inputForm.find('input');
        this.verbEl = $('#verb');
        this.conjugaisonEL = $('#conjugaison');
        this.successEl = $('#success');
        this.errorEl = $('#error');
        this.initInput();
        this.delay = 1000;
        this.disabled = false;
    }

    initInput() {
        var self = this;
        this.inputForm.on('submit', function(e) {
            e.preventDefault();
            if( self.disabled ) return;
            self.checkAnswer();
        });
    }

    generate() {
        this.generateVerb();
        this.displayVerb();
    }

    generateVerb() {
        this.verbEl.attr('data-status', null);
        this.verb = this.verbs[ Math.floor( Math.random() * this.verbs.length ) ];
        this.conjugaison = this.verb.forms[ Math.floor( Math.random() * this.verb.forms.length ) ];
    }

    displayVerb(result = false) {
        this.verbEl.text( result ? this.conjugaison.value : this.verb.dictionnary );
        this.conjugaisonEL.text( this.conjugaison.label );
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

    constructor(dictionnary, negative, polite, conditional, imperative, volitional) {
        this.dictionnary = dictionnary;
        this.forms = [
            { label : 'negative',       value : negative },
            { label : 'polite',         value : polite },
            { label : 'conditional',    value : conditional },
            { label : 'imperative',     value : imperative },
            { label : 'volitional',     value : volitional },
        ]
    }

}

$(function() {

    var verbs = [
        new Verb('miru', 'minai', 'mimasu', 'mireba', 'miro', 'miyou'),
        new Verb('kau', 'kawanai', 'kaimasu', 'kaeba', 'kae', 'kaou'),
        new Verb('iku', 'ikanai', 'ikimasu', 'ikeba', 'ike', 'ikou'),
        new Verb('okiru', 'okinai', 'okimasu', 'okireba', 'okiro', 'okiyou'),
    ]

    var quiz = new Quiz(verbs);

    quiz.generate();

});