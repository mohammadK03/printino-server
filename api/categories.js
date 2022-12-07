let express = require('express')
let router = express.Router();
let Category = require('../model/Category');
let messageToClient = require('../utils/messages').messageToClient;
const vToken = require('../utils/jwt')
const lang=require('../utils/lang')

function isAdmin(req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));
    }
}

router.get('/', async (req, res) => {
    let slug = req.query.slug;
    let query = null;
    let language=req.query.lang;
    if (slug) {
        query = { "ancestors.slug": slug }
    }
    
    let type = req.query.type;
    if (type !== "lazy") {
        try {
            let categories = await Category.find(query)
            categories= lang.setLangs(categories,language,true);
            categories.forEach((item, index, object) => {
                const found = categories.find(element => element._id + "" === item.parent + "");
                if (found) {
                    if (!found.children) {
                        found.children = [];
                    }
                    found.children.push(item);
                   
                    //object.splice(index, 1);
                }
            });
            for (var i = categories.length - 1; i >= 0; i--) {

                if (categories[i].parent != null) {
                    categories.splice(i, 1);

                }

            }

            res.status(201).json(messageToClient(true, "categories", categories));
        } catch (err) {
            console.log(err)
            res.status(500).send(err);
        }
    } else {
        let parent=null;
        if(query!=null){
            const category = await Category.findOne({slug});
            if(category){
                parent=category._id;
            }else{
               return res.status(201).json(messageToClient(true, "categories", []));

            }
        }

        let categories = await Category.aggregate([
            {
                '$match': {
                    'parent': parent
                }
            }, {
                '$lookup': {
                    'from': 'categories',
                    'localField': '_id',
                    'foreignField': 'parent',
                    'as': 'childs'
                }
            }
        ])
 
        res.status(201).json(messageToClient(true, "categories", categories));


    }


});

router.get('/:id', async (req, res) => {
    try {
        let category=await Category.findOne({_id:req.params.id});
        res.status(201).json(messageToClient(true, "category", category));

    } catch (error) {
        res.json(messageToClient(false, "internall_error", error.message));

    }


});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    let parent = req.body.parent ? req.body.parent : null;
    let image = req.body.image;
    let data = { name: req.body.name, parent, image: { url: null } };
    if (image) {
        data.image = image;
    }
    const category = new Category(data)
    try {
        let newCategory = await category.save();
        buildAncestors(newCategory._id, parent)
        res.status(201).json(messageToClient(true, 'category_added', newCategory));
    } catch (error) {
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        let name = req.body.name;
        let image = req.body.image;

        let update = {}
        if (name) {
            update.name = name;
        }
        if (image) {
            update.image = image;
        }

        await Category.updateOne({ _id: req.params.id }, update);
        res.status(200).send(messageToClient(true, 'category_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        await Category.deleteOne({ _id: req.params.id });
        await Category.deleteMany({ parent: req.params.id });

        res.status(200).send(messageToClient(true, 'category_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});


const buildAncestors = async (id, parent_id) => {
    let ancest = [];
    try {
        let parent_category = await Category.findOne({ "_id": parent_id }, { "name": 1, "slug": 1, "ancestors": 1, "image": 1 }).exec();
        if (parent_category) {
            const { _id, name, slug, image } = parent_category;
            const ancest = [...parent_category.ancestors];
            ancest.unshift({ _id, name, slug })
            const category = await Category.findByIdAndUpdate(id, { $set: { "ancestors": ancest } });
        }
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = router;