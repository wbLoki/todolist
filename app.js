const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/todolistDB");

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
  const title = req.body.page;
  console.log(req.body.item);
  Item.findByIdAndRemove(checkedItemId, function(err){if(err){console.log(err)}else{console.log("Deleted successfully! "+checkedItemId); res.redirect("/" + title);}});
});

// NEW PAGE TEMPLATE -------------------------->
app.get("/:paramName", function(req, res){
  const title = req.params.paramName;
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

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
