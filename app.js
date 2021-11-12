const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect("mongodb+srv://root:root@cluster0.15wky.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, items){

    if(err){ console.log(err); }
  
    else if (items.length === 0) {
      Item.insertMany(defaultItems, function(err, items) {
        if (err) {console.log(err);}
        else { console.log("Items saved successfully!"); }
      });
      res.redirect("/");
    } else { res.render("list", {listTitle: "Today", newListItems: items}); }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(itemName);
  
  const item = new Item ({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      } else {console.log(err);}
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.item;
  const listName = req.body.page;
  
  if(listName === "Today"){
    Item.findOneAndDelete({ _id: checkedItemId}, function(err){
      if(err){console.log(err)}
      else{
        console.log("Deleted successfully! "); res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){res.redirect("/"+listName);}
    });
  }
});


// NEW PAGE TEMPLATE -------------------------->
app.get("/:paramName", function(req, res){
  const title = _.capitalize(req.params.paramName);
  console.log(title);
  List.findOne({name: title}, function(err, list){
    if(err){ console.log(err); }
    else if (!list) {
        console.log("doesn't exist!");
        const list = new List({
          name: title,
          items: defaultItems
        });
        list.save();
        res.render("list", {listTitle: title, newListItems: list.items});
      } else {
        console.log("exists!");
        res.render("list", {listTitle: title, newListItems: list.items});
      }
    }
  );
});

//   Item.find({}, function(err, items){

//     if(err){ console.log(err); }
  
//     else if (items.length === 0) {
//       Item.insertMany(defaultItems, function(err, items) {
//         if (err) {console.log(err);}
//         else { console.log("Items saved successfully!"); }
//       });
//       res.redirect(":paramName");
//     } else { res.render("list", {listTitle: title, newListItems: items}); }
//   });
// });



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully!");
});
