const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');     //Mapbox
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index =async (req,res)=>{
    const allListings =await Listing.find({});
    res.render("listings/index.ejs",{allListings});
 };

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} =req.params;
    const listing =await Listing.findById(id).populate({path:"reviews" , populate:{path:"author"}}).populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exists!");
       res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async (req, res,next)=>{
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image ={url , filename};

    newListing.geometry=response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created !");
    res.redirect("/listings"); 
}

module.exports.renderEditForm=async (req,res) =>{
    let {id} =req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exists!");
        res.redirect("/listings");
     }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");

    res.render("listings/edit.ejs",{listing , originalImageUrl});
}

module.exports.renderPaymentReqForm = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        let { id } = req.params;

        // Validate listing ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid listing ID.");
            return res.redirect("/listings");
        }

        // Fetch the listing
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Ensure user is logged in
        if (!req.user) {
            req.flash("error", "You must be logged in to access this page.");
            return res.redirect("/login");
        }

        // Render the payment form
        res.render("listings/reqPay.ejs", { listing, user: req.user });
    } catch (err) {
        console.error("Error in renderPaymentReqForm:", err);
        req.flash("error", "An error occurred while fetching the listing.");
        res.redirect("/listings");
    }
};

module.exports.reservedReq = async (req, res) => {
    try {
      const { id } = req.params; // Listing ID from URL
      const userId = req.user.id; // User ID (ensure the user is authenticated)
  
      console.log(`Attempting to reserve listing with ID: ${id} by user: ${userId}`);
  
      // Fetch the listing from the database
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      // Check if the listing is already reserved
      if (listing.reserved) {
        return res.status(400).json({ message: 'This property is already reserved' });
      }
  
      // Reserve the property: update reserved and reservedBy fields
      listing.reserved = true;
      listing.reservedBy = userId;
      await listing.save(); // Save the updated listing
  
      res.status(200).json({ message: 'Reservation successful', listing });
    } catch (error) {
      console.error('Error reserving listing:', error);
      res.status(500).json({
        message: 'Failed to reserve. Try again later.',
        error: error.message
      });
    }
  };
  






module.exports.updateListing=async (req,res)=>{
    let {id} =req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});

    if (typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image ={url,filename};
        await listing.save();
    }
   
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing =async (req,res)=>{
    let {id} =req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   req.flash("success","Listing Deleted !");
    res.redirect("/listings");
}



module.exports.getListingsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const listings = await Listing.find({ category });
        res.json(listings); // Return listings as JSON for frontend use
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while fetching listings.');
        res.status(500).send('Error fetching listings');
    }
};


// Search listings based on query (title, location, category)
module.exports.searchOption = async (req, res) => {
    try {
      const searchQuery = req.query.query || '';  // Get search term from query params
      const categoryFilter = req.query.category || ''; // Filter by category (optional)
      
      // Build a search filter
      let filter = {};
      if (searchQuery) {
        filter.$or = [
          { title: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on title
          { location: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on location
        ];
      }
  
      if (categoryFilter) {
        filter.category = categoryFilter; // If category is provided, filter by it
      }
  
      // Fetch filtered listings from MongoDB using the filter
      const allListings = await Listing.find(filter).populate('reviews').exec(); // .populate() is used to fetch reviews as well
  
      // Render the index page with the fetched listings
      res.render('listings/index', { allListings });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};
