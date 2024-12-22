const express = require("express");
const router = express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const {isLoggedIn ,isOwner ,validateListing} =require("../middleware.js");
const listingController =require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.get('/search',wrapAsync(listingController.searchOption));     //Search Route for navbar search option

 //New Route
 router.get("/new",isLoggedIn ,listingController.renderNewForm);
 
 
router.route("/")
        .get(wrapAsync(listingController.index))   //Index Route
        .post(isLoggedIn ,upload.single('listing.image'),validateListing ,wrapAsync( listingController.createListing ) );   //Create Route


router.route("/:id")
        .get(wrapAsync( listingController.showListing))     //Show Route
        .put(isLoggedIn ,isOwner ,upload.single('listing.image'), validateListing ,wrapAsync(listingController.updateListing))   //Update Route
        .delete(isLoggedIn ,isOwner, wrapAsync(  listingController.destroyListing));         //Delete route


//Edit Route
router.get("/:id/edit",isLoggedIn , isOwner ,wrapAsync( listingController.renderEditForm));



// Route to fetch listings by category (returns JSON)
router.get('/category/:category', wrapAsync(listingController.getListingsByCategory));



module.exports=router;

