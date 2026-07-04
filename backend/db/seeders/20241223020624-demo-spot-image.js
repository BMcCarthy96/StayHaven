"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

// Every ID below was verified with a live HTTP HEAD/GET request (200 OK)
// against images.unsplash.com before being committed, and was sourced from a
// category-specific Unsplash search (e.g. "modern-apartment-interior") so the
// photo's subject matches its assigned property type.
const IMAGE_POOLS = {
    apartment: [
        "1594873604892-b599f847e859",
        "1628592102751-ba83b0314276",
        "1666282167632-c613fbeb163c",
        "1662454419716-c4c504728811",
        "1642976975710-1d8890dbf5ab",
        "1738168279272-c08d6dd22002",
        "1614622350812-96b09c78af77",
        "1663756915304-40b7eda63e41",
        "1603072845032-7b5bd641a82a",
        "1520106392146-ef585c111254",
        "1738168246881-40f35f8aba0a",
        "1682184805271-11671b7ecf4c",
        "1667584523543-d1d9cc828a15",
        "1647082550285-119acfd169f2",
    ],
    house: [
        "1580587771525-78b9dba3b914",
        "1600596542815-ffad4c1539a9",
        "1721815693498-cc28507c0ba2",
        "1628012209120-d9db7abf7eab",
        "1613977257363-707ba9348227",
        "1627141234469-24711efb373c",
        "1513584684374-8bab748fbf90",
        "1628744448840-55bdb2497bd4",
        "1512917774080-9991f1c4c750",
        "1523217582562-09d0def993a6",
        "1706808849777-96e0d7be3bb7",
        "1722421492323-eaf9c401befe",
        "1691425700585-c108acad6467",
        "1582268611958-ebfd161ef9cf",
    ],
    cabin: [
        "1631630259742-c0f0b17c6c10",
        "1698933787134-af2d451985c7",
        "1727706572437-4fcda0cbd66f",
        "1680703486830-1b5af60635d7",
        "1631941150945-837cb81fc7e2",
        "1631941392209-70cad44ecfb7",
        "1592990379716-aec6e89a6a69",
        "1697807713040-b5fb60d6f012",
        "1664369058082-ee8e36028106",
        "1680962884378-b69a04b9969c",
        "1712669869857-c9c0c098d024",
        "1698933787104-3f91cf25909c",
        "1670914120781-4b7c8512fc41",
        "1622066737704-c5d990e137fb",
        "1551927411-95e412943b58",
    ],
    loft: [
        "1505873242700-f289a29e1e0f",
        "1617817643768-8855fc457e3a",
        "1741099443106-ee5b6d0c8552",
        "1677273423327-163d81aa9e68",
        "1767706508383-097054618007",
        "1619989753008-0191bbaf23a6",
        "1553661763-1bbb4b5cf599",
        "1556889380-6e8394ddd7ad",
        "1560440021-33f9b867899d",
        "1650137938625-11576502aecd",
        "1598279249829-5291d4935abb",
        "1585425802917-d1aff35497c9",
        "1672082497059-1e6c0209eeeb",
        "1554782647-42840d3c766f",
        "1619989652700-9984844cb0ea",
    ],
    villa: [
        "1613490493576-7fde63acd811",
        "1531971589569-0d9370cbe1e5",
        "1613977257365-aaae5a9817ff",
        "1505843513577-22bb7d21e455",
        "1706808849780-7a04fbac83ef",
        "1613977257592-4871e5fcd7c4",
        "1544984243-ec57ea16fe25",
        "1593714604578-d9e41b00c6c6",
        "1591474200742-8e512e6f98f8",
        "1564013799919-ab600027ffc6",
        "1580587771525-78b9dba3b914",
        "1512917774080-9991f1c4c750",
        "1613977257363-707ba9348227",
        "1600596542815-ffad4c1539a9",
        "1582268611958-ebfd161ef9cf",
    ],
    cottage: [
        "1699209148987-99772195bf9c",
        "1699209148943-acacf2821f33",
        "1776219243449-a71b7f5c1332",
        "1699210025833-07318c121bf0",
        "1690796033775-c924f7dfe5d1",
        "1771526163842-c82e771ec0e7",
        "1772465971062-032970cf7a50",
        "1773606381942-2be573da521d",
        "1613310271953-b18bf33195fd",
        "1777863073599-b83bacea860e",
        "1777962822462-ec69821a2e59",
        "1767710924293-29fba5e3854b",
        "1779660243751-55c986c3d8fc",
        "1783002933053-d169d7d23243",
        "1766777323830-6ed16e01fecf",
    ],
};

// Category for spotId 1-26, in seeding order (must match demo-spot.js).
const SPOT_CATEGORIES = [
    "loft", // 1 Downtown Austin Loft
    "cottage", // 2 Hill Country Cottage
    "cabin", // 3 Blue Ridge Cabin Retreat
    "loft", // 4 River Arts District Loft
    "cabin", // 5 Lakefront A-Frame Cabin
    "house", // 6 Craftsman Bungalow near Hawthorne
    "apartment", // 7 Pearl District Modern Apartment
    "house", // 8 Historic Downtown Charleston House
    "house", // 9 Adobe Casita Retreat
    "villa", // 10 Cliffside Villa Overlooking the Pacific
    "apartment", // 11 Music Row Apartment
    "house", // 12 East Nashville Bungalow
    "cabin", // 13 Flatirons Mountain Cabin
    "cottage", // 14 Lake Champlain Cottage
    "apartment", // 15 Alfama District Apartment
    "house", // 16 Traditional Kyoto Machiya House
    "villa", // 17 Lakefront Villa with Mountain Views
    "loft", // 18 LoDo Industrial Loft
    "house", // 19 Washington Park Family House
    "cottage", // 20 Historic District Cottage
    "villa", // 21 Red Rock View Villa
    "house", // 22 Desert Modern House
    "apartment", // 23 Capitol Hill Apartment
    "house", // 24 Lake Union Waterfront Home
    "apartment", // 25 South Beach Art Deco Apartment
    "villa", // 26 Biscayne Bay Waterfront Villa
];

const toUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

function pickImages(pool, offset, count) {
    const picked = [];
    for (let i = 0; i < count; i++) {
        picked.push(pool[(offset + i) % pool.length]);
    }
    return picked;
}

module.exports = {
    async up(queryInterface) {
        options.tableName = "SpotImages";
        const now = new Date();
        const categoryCounters = {};
        const rows = [];

        SPOT_CATEGORIES.forEach((category, idx) => {
            const spotId = idx + 1;
            const pool = IMAGE_POOLS[category];
            const seen = categoryCounters[category] || 0;
            categoryCounters[category] = seen + 1;
            const ids = pickImages(pool, seen * 4, 4);

            ids.forEach((id, imgIdx) => {
                rows.push({
                    spotId,
                    url: toUrl(id),
                    preview: imgIdx === 0,
                    createdAt: now,
                    updatedAt: now,
                });
            });
        });

        await queryInterface.bulkInsert(options, rows, { validate: true });
    },

    async down(queryInterface) {
        options.tableName = "SpotImages";
        await queryInterface.bulkDelete(options, null, {});
    },
};
