import mongoose from "mongoose";

const mongoUri = "mongodb://127.0.0.1:27017/storedb";

const dropIndex = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            const collection = mongoose.connection.db.collection(col.name);
            const indexes = await collection.listIndexes().toArray();
            const slugIndex = indexes.find(idx => idx.key.slug);
            if (slugIndex) {
                console.log(`❌ Found slug index in collection: ${col.name}. Dropping it...`);
                await collection.dropIndex(slugIndex.name);
                console.log(`✅ Dropped slug index in collection: ${col.name}`);
            }
        }
        await mongoose.disconnect();
        console.log("🎉 Index cleanup completed!");
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
};

dropIndex();
