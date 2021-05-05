const express = require('express');
const mongoose = require('mongoose');
const bodyParse = require('body-parser');
const ejs = require('ejs');
const lodash = require('lodash');

const app = express();
const port = process.env.PORT || 4177;

app.use(bodyParse.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// SECTION: Database Connection & Schema 

mongoose.connect('mongodb://localhost:27017/wikiDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, () => {
    console.log('Connected to MongoDB Database');
});

const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const Article = mongoose.model('Article', articleSchema);

// SECTION: Routing

// NOTE: Requests targeting all articles
app.route('/articles')
    .get((req, res) => {
        Article.find({}, (err, results) => {
            if (!err) {
                res.send(results)
            } else {
                res.send(err);
            }
        });
    })
    .post((req, res) => {
        const articleTitle = req.body.title;
        const articleContent = req.body.content;

        const newArticle = new Article({
            title: articleTitle,
            content: articleContent
        });

        newArticle.save((err) => {
            if (!err) {
                res.send('Article posted and saved successfully');
            } else {
                res.send(err);
            }
        });
    })
    .delete((req, res) => {
        Article.deleteMany({}, (err) => {
            if (!err) {
                res.send('Deleted all articles successfully');
            } else {
                res.send(err);
            }
        });
    });

// NOTE: Requests targeting a specific article
app.route('/articles/:articleTitle')
    .get((req, res) => {
        const requestedArticleTitle = lodash.upperFirst(req.params.articleTitle);

        Article.findOne({
            title: requestedArticleTitle
        }, (err, result) => {
            if (result) {
                res.send(result);
            } else {
                res.send('No article with the specified title was found');
            }
        })
    })
    .put((req, res) => {
        const requestedArticleTitle = lodash.upperFirst(req.params.articleTitle);

        Article.replaceOne({
            title: requestedArticleTitle
        }, {
            title: req.body.title,
            content: req.body.content
        }, (err, result) => {
            if (!err) {
                res.send('Article replaced successfully');
            } else {
                res.send(err)
            }
        });

    })
    .patch((req, res) => {
        const requestedArticleTitle = lodash.upperFirst(req.params.articleTitle);
        
        Article.updateOne({
            title: requestedArticleTitle
        }, {
            $set: req.body
        }, (err, result) => {
            if (!err) {
                res.send('Article was patched succesfully');
            } else {
                res.send(err);
            }
        });

    })
    .delete((req, res) => {
        const requestedArticleTitle = lodash.upperFirst(req.params.articleTitle);

        Article.deleteOne({
            title: requestedArticleTitle
        }, (err) => {
            if (!err) {
                res.send('Article deleted successfully');
            } else {
                res.send(err);
            }
        }); 

    });

// SECTION: Listening

app.listen(port, () => {
    console.log(`Server started successfully`);
});