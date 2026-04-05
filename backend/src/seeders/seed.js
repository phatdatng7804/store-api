import "dotenv/config";
import mongoose from "mongoose";
import Role from "../models/role.model.js";
import Color from "../models/color.model.js";
import Size from "../models/size.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/storedb";

const seed = async () => {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Roles
    const roles = [
        { code: "ADMIN", name: "Administrator" },
        { code: "USER", name: "Customer" }
    ];
    for (const role of roles) {
        await Role.findOneAndUpdate({ code: role.code }, role, { upsert: true, new: true });
    }
    console.log("✅ Seeded roles");

    // Colors  
    const colors = [
        { name: "Black", hexcode: "#000000" },
        { name: "Ivory", hexcode: "#FFFFF0" },
        { name: "Stone", hexcode: "#928E85" },
        { name: "Denim", hexcode: "#1560BD" },
        { name: "Olive", hexcode: "#808000" },
        { name: "White", hexcode: "#FFFFFF" },
        { name: "Beige", hexcode: "#F5F5DC" },
        { name: "Navy", hexcode: "#001F5B" },
    ];
    for (const color of colors) {
        await Color.findOneAndUpdate({ name: color.name }, color, { upsert: true, new: true });
    }
    console.log("✅ Seeded colors");

    // Sizes
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
    for (const name of sizes) {
        await Size.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    }
    console.log("✅ Seeded sizes");

    // Categories
    const categories = [
        { name: "Women", description: "Thời trang nữ" },
        { name: "Men", description: "Thời trang nam" },
        { name: "Street", description: "Phong cách đường phố" },
        { name: "Office", description: "Trang phục văn phòng" },
        { name: "Accessories", description: "Phụ kiện thời trang" },
        { name: "Sale", description: "Hàng giảm giá" },
    ];
    for (const cat of categories) {
        await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }
    console.log("✅ Seeded categories");

    // Admin user
    const adminRole = await Role.findOne({ code: "ADMIN" });
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
        await User.create({
            username: "admin",
            email: "admin@store.com",
            password: "admin123",
            fullName: "Administrator",
            phone: "0900000000",
            role: adminRole._id,
            isActive: true
        });
        console.log("✅ Created admin user: admin / admin123");
    } else {
        console.log("ℹ️  Admin user already exists");
    }

    // Sample Products
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
        const catWomen = await Category.findOne({ name: "Women" });
        const catMen = await Category.findOne({ name: "Men" });
        const catStreet = await Category.findOne({ name: "Street" });
        const catOffice = await Category.findOne({ name: "Office" });
        const catSale = await Category.findOne({ name: "Sale" });

        const colorBlack = await Color.findOne({ name: "Black" });
        const colorIvory = await Color.findOne({ name: "Ivory" });
        const colorStone = await Color.findOne({ name: "Stone" });
        const colorDenim = await Color.findOne({ name: "Denim" });
        const colorOlive = await Color.findOne({ name: "Olive" });

        const sizeS = await Size.findOne({ name: "S" });
        const sizeM = await Size.findOne({ name: "M" });
        const sizeL = await Size.findOne({ name: "L" });
        const sizeXL = await Size.findOne({ name: "XL" });

        const sampleProducts = [
            { name: "Áo Trench Coat Classic", description: "Áo khoác trench coat cổ điển, chất liệu cao cấp", imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400", category: catWomen?._id, price: 1290000 },
            { name: "Váy Maxi Bohemian", description: "Váy maxi phong cách bohemian tự do, bay bổng", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400", category: catWomen?._id, price: 890000 },
            { name: "Áo Sơ Mi Oxford Nam", description: "Áo sơ mi Oxford nam, phù hợp công sở và dạo phố", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", category: catMen?._id, price: 750000 },
            { name: "Quần Jean Slim Fit", description: "Quần jean ôm vừa, wash đậm phong cách", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", category: catStreet?._id, price: 950000 },
            { name: "Blazer Nữ Công Sở", description: "Blazer nữ sang trọng, phù hợp văn phòng", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4a5a9a?w=400", category: catOffice?._id, price: 1590000 },
            { name: "Áo Hoodie Oversize", description: "Hoodie oversize phong cách street wear", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", category: catStreet?._id, price: 680000 },
            { name: "Đầm Cocktail Dự Tiệc", description: "Đầm cocktail thanh lịch cho buổi tiệc", imageUrl: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=400", category: catWomen?._id, price: 1890000 },
            { name: "Áo Polo Nam Sale", description: "Áo polo nam chất lượng cao, đang giảm giá", imageUrl: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400", category: catSale?._id, price: 420000 },
        ];

        for (const p of sampleProducts) {
            const product = await Product.create({
                name: p.name,
                description: p.description,
                imageUrl: p.imageUrl,
                category: p.category,
                active: true
            });

            // Create 2-3 variants per product
            const variantDefs = [
                { color: colorBlack, size: sizeM, sku: `${product.name.substring(0,3).toUpperCase()}-BLK-M`, stock: 15 },
                { color: colorIvory, size: sizeS, sku: `${product.name.substring(0,3).toUpperCase()}-IVY-S`, stock: 10 },
                { color: colorStone, size: sizeL, sku: `${product.name.substring(0,3).toUpperCase()}-STN-L`, stock: 8 },
            ];

            let skuCounter = 1;
            for (const v of variantDefs) {
                if (!v.color || !v.size) continue;
                try {
                    await ProductVariant.create({
                        product: product._id,
                        color: v.color._id,
                        size: v.size._id,
                        name: `${p.name} - ${v.color.name} ${v.size.name}`,
                        sku: v.sku + skuCounter++,
                        price: p.price,
                        stock: v.stock
                    });
                } catch (_) { /* skip duplicate SKU */ }
            }
        }
        console.log("✅ Seeded 8 sample products with variants");
    } else {
        console.log(`ℹ️  ${existingProducts} products already exist, skipping`);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("   Admin login: username=admin, password=admin123");
    await mongoose.disconnect();
};

seed().catch(err => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});

