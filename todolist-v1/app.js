const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});


const itemsSchema = {
    name: String
}; 
const Item = mongoose.model("Item", itemsSchema);


const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){    
    Item.find(function(err, foundItems){
        res.render('list', {listType : "Today", newListItems : foundItems});
    });
});


app.get("/:customListName",function(req, res){
    const customList = req.params.customListName;

    List.findOne({name: customList},function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customList
                });
                list.save(); 
                res.redirect("/" + customList);           
            }else{
                res.render("list", {listType : foundList.name, newListItems : foundList.items});
            }
        }
    });

});


app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/"); 
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});


app.post("/delete",function(req, res){
    const itemId = req.body.checkbox;
    Item.findByIdAndRemove(itemId,function(err){
        if(!err){
            console.log("deleted Successfully");
        }
    });
    res.redirect("/");
});


app.get("/about",function(req, res){
    res.render("about");
});


app.listen(3000, function(){
    console.log("server started at port 3000");
});