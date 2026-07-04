"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};

// Reviewer is always someone other than the spot's own owner. A handful of
// spots are intentionally left with zero reviews so the app shows a natural
// mix of established and brand-new listings.
const REVIEWS = [
    { spotId: 1, userId: 2, stars: 5, age: 40, review: "Amazing location right in the middle of downtown Austin — walked to three different live music venues without needing a car." },
    { spotId: 1, userId: 4, stars: 4, age: 12, review: "Loved the rooftop view at night, though it can get a little noisy on weekends with the bars nearby." },
    { spotId: 2, userId: 3, stars: 5, age: 55, review: "So peaceful compared to the city. The porch was perfect for morning coffee under the oak trees." },
    { spotId: 2, userId: 5, stars: 4, age: 20, review: "Great for a relaxing weekend, though a car is a must out here." },
    { spotId: 3, userId: 1, stars: 5, age: 70, review: "The fireplace made the cold mountain nights so cozy, and the view of the ridge from the deck was incredible." },
    { spotId: 3, userId: 4, stars: 5, age: 25, review: "Beautiful cabin, very well kept. Would definitely stay again in the fall for the leaves." },
    { spotId: 5, userId: 2, stars: 5, age: 88, review: "Walked right down to the lake every morning. The loft bedroom was a fun little touch." },
    { spotId: 5, userId: 3, stars: 4, age: 33, review: "Great cabin for a ski weekend — cozy and warm after a full day on the slopes." },
    { spotId: 6, userId: 4, stars: 5, age: 60, review: "Loved all the original woodwork, felt like stepping back in time. Hawthorne's cafes were an easy walk." },
    { spotId: 6, userId: 5, stars: 4, age: 18, review: "Charming house, the backyard patio was a nice surprise for morning coffee." },
    { spotId: 7, userId: 1, stars: 5, age: 45, review: "Super clean and modern, walking distance to Powell's Books which was a huge plus for us." },
    { spotId: 7, userId: 3, stars: 3, age: 9, review: "Comfortable stay, though street noise was noticeable at night with the window cracked." },
    { spotId: 8, userId: 2, stars: 5, age: 100, review: "The piazza was the highlight — sipped coffee out there every morning. Walk to the Battery was gorgeous." },
    { spotId: 8, userId: 4, stars: 5, age: 30, review: "Beautiful historic home, exactly as pictured and very well maintained." },
    { spotId: 10, userId: 1, stars: 5, age: 50, review: "Worth every penny. Waking up to the fog rolling over the water was unforgettable." },
    { spotId: 10, userId: 2, stars: 5, age: 15, review: "The most incredible views I've ever had from a rental. The hot tub at night was magic." },
    { spotId: 11, userId: 3, stars: 4, age: 40, review: "Great location, an easy walk to Broadway without the noise following us home." },
    { spotId: 11, userId: 5, stars: 4, age: 22, review: "Solid stay for a bachelorette weekend, would book again without hesitation." },
    { spotId: 12, userId: 1, stars: 5, age: 65, review: "Loved the neighborhood vibe — so many good coffee shops within walking distance." },
    { spotId: 12, userId: 4, stars: 4, age: 14, review: "The screened porch was perfect in the evenings, even with the AC off." },
    { spotId: 13, userId: 2, stars: 5, age: 80, review: "Unreal view of the Flatirons from the deck. The hot tub after a day of hiking was perfect." },
    { spotId: 13, userId: 5, stars: 5, age: 27, review: "Great base for the trailheads, and the cabin itself was spotless." },
    { spotId: 14, userId: 1, stars: 5, age: 48, review: "Kayaking right from the cottage was such a treat. Sunsets over the lake were beautiful." },
    { spotId: 14, userId: 3, stars: 4, age: 11, review: "Cozy and well located, a short walk to Church Street for dinner." },
    { spotId: 16, userId: 2, stars: 5, age: 90, review: "Such a unique stay — loved the tatami rooms and the little interior garden. Walking distance to Kiyomizu-dera." },
    { spotId: 16, userId: 5, stars: 5, age: 35, review: "Beautiful traditional house, very quiet and peaceful even in a busy neighborhood." },
    { spotId: 17, userId: 3, stars: 5, age: 58, review: "The view across the lake to the Remarkables is unbeatable. Loved kayaking from the private dock." },
    { spotId: 17, userId: 4, stars: 5, age: 19, review: "Spacious and gorgeous, perfect for our group trip with plenty of room to spread out." },
    { spotId: 18, userId: 1, stars: 4, age: 42, review: "Great location for a Rockies game — exposed brick gave it a lot of character." },
    { spotId: 18, userId: 2, stars: 4, age: 8, review: "Fun industrial vibe, walkable to all the best breweries in LoDo." },
    { spotId: 20, userId: 1, stars: 5, age: 72, review: "So charming — the Spanish moss outside made it feel like a postcard. Short walk to Forsyth Park." },
    { spotId: 20, userId: 3, stars: 5, age: 24, review: "Lovely cottage on a quiet square, would absolutely stay again." },
    { spotId: 21, userId: 2, stars: 5, age: 52, review: "The infinity pool view of Cathedral Rock at sunset was worth the whole trip by itself." },
    { spotId: 21, userId: 4, stars: 5, age: 16, review: "Stunning villa, the hot tub under the stars was incredible after a day of hiking." },
    { spotId: 25, userId: 2, stars: 4, age: 38, review: "Steps from the beach, and the Art Deco building itself was gorgeous inside and out." },
    { spotId: 25, userId: 3, stars: 3, age: 6, review: "Great location right on Ocean Drive, though it can get loud at night." },
];

module.exports = {
    async up(queryInterface) {
        options.tableName = "Reviews";
        await queryInterface.bulkInsert(
            options,
            REVIEWS.map((r) => ({
                spotId: r.spotId,
                userId: r.userId,
                review: r.review,
                stars: r.stars,
                createdAt: daysAgo(r.age),
                updatedAt: daysAgo(r.age),
            })),
            { validate: true }
        );
    },

    async down(queryInterface) {
        options.tableName = "Reviews";
        await queryInterface.bulkDelete(options, null, {});
    },
};
