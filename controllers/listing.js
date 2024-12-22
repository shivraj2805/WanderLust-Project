const Listing=require("../models/listing");

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
    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image ={url , filename};
    await newListing.save();
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