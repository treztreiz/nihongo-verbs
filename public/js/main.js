class Quiz {

    constructor(verbs) {

        this.score = { success : 0, error : 0 };
        this.verb = null;
        this.conjugaison = null;
        this.negated = false;
        this.verbs = verbs;
        this.inputForm = $('#form'), this.input = this.inputForm.find('input');

        this.typeEl = $('#type');
        this.verbEl = $('#verb');
        this.kanjiEl = $('#kanji');
        this.tenseEl = $('#tense');
        this.posEl = $('#pos');
        this.formalityEL = $('#formality');
        this.successEl = $('#success');
        this.errorEl = $('#error');
        this.studyEl = $('#study');

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
        //if( verb === this.verb ) return this.generateVerb();
        this.verb = verb;

        // BUG TYPE CORRECTION
        switch(verb.romaji) {
            case 'dekakeru' :
            case 'okiru' : this.type = 'ichidan'; break;
            default : this.type = this.morpho.getVerbType(verb.kanji);
        }

        var keys = Object.keys(this.forms);
        var key = keys[ Math.floor( Math.random() * keys.length ) ];
        var conj = this.forms[ key ];
        this.tense = 'tense' in conj ? conj.tense : conj.mood;

        var formalities = ['plain', 'polite'];
        key == 'prov' ? this.formality = 'plain' : this.formality = formalities[ Math.floor( Math.random() * formalities.length ) ];

        this.negated = key == 'vol' ? false : Math.floor( Math.random() * 2 );

        var params = { vtype: this.type, formality : this.formality, negated : this.negated, ...conj };
        this.conjugaison = this.morpho.conjugate(verb.kanji, params);

        this.convertKanji();
        
    }

    convertKanji() {
        var self = this;
        this.disabled = true;
        var kuroshiro = new Kuroshiro();
        kuroshiro.init(new KuromojiAnalyzer())
        .then(function () {
            return kuroshiro.convert(self.conjugaison, { to: "hiragana" });
        })
        .then(function(result){
            self.conjugaison =  result;
            self.disabled = false;
            console.log( self.conjugaison );
        });
    }

    displayVerb(result = false) {
        this.kanjiEl.text( this.verb.kanji );
        this.verbEl.text( result ? this.conjugaison : this.verb.kana );
        this.tenseEl.text( this.tense.toLowerCase() );
        this.posEl.text( this.negated ? 'negative' : 'positive' );
        this.formalityEL.text( this.formality );
        this.typeEl.text(this.type + ' verb');
        //this.studyEl.attr('href', 'http://japaneseverbconjugator.com/VerbDetails.asp?txtVerb=' + this.verb.kanji + '&Go=Conjugate');
        this.studyEl.attr('href', 'https://conjugueur.reverso.net/conjugaison-japonais-verbe-' + this.verb.kanji + '.html');
    }

    checkAnswer() {
        var self = this;
        var answer = this.input.val();
        var regex = new RegExp('^' + this.conjugaison.replace(/\//g, '|') + '$');
        regex.exec(answer) !== null ? this.success() : this.error();
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

    M.AutoInit();

    var verbs = [
        new Verb('見る', 'miru'),
        new Verb('買う', 'kau'),
        new Verb('行く', 'iku'),
        new Verb('起きる', 'okiru'),
        new Verb('来る','kuru'),
        new Verb('集める','atsumeru'),
        new Verb('食べる', 'taberu'),
        new Verb('飲む', 'nomu'),
        new Verb('出かける', 'dekakeru'),
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

    $.post(Routing.generate('info', { verb: '買う' }), data => {
        console.log(data);
    }).fail( err => console.error(err) );

    // const jisho = new window.JishoApi();
    // jisho.searchForPhrase('日').then(result => {
    //     console.log(result);
    // });

    // $.ajax({
    //     type: 'GET',
    //     crossDomain: true,
    //     dataType: 'jsonp',
    //     beforeSend: function(request) {
    //         request.setRequestHeader("Set-Cookie", "Secure;SameSite=Strict");
    //     },
    //     url: 'https://jisho.org/api/v1/search/words?keyword=日',
    //     success: function(jsondata){
    //         console.log(jsondata);
    //     },
    //     error: function(err) {
    //         console.log(err);
    //     }
    // });

    // $.get('https://jisho.org/api/v1/search/words?keyword=日', function(data){
    //     console.log(data);
    // });

});