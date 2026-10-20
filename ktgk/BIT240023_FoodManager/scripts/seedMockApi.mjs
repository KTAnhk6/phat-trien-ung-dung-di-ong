const BASE_URL = 'https://6ad72199f71f154ac487d56c.mockapi.io/ai/v1';

const INITIAL_CATEGORIES = [
  {
    BIT240023_Name: 'Appetizers & Starters (Khai vị)',
    BIT240023_Description: 'Fresh rolls, crispy appetizers and light beginnings',
  },
  {
    BIT240023_Name: 'Main Courses (Món chính)',
    BIT240023_Description: 'Traditional noodles, rice dishes, and signature bowls',
  },
  {
    BIT240023_Name: 'Desserts & Drinks (Tráng miệng & Đồ uống)',
    BIT240023_Description: 'Vietnamese traditional sweet soups, coffee and refreshers',
  },
  {
    BIT240023_Name: 'Specialties (Món đặc sắc)',
    BIT240023_Description: 'Chef signature specials and seasonal culinary dishes',
  },
];

async function seed() {
  console.log('Seeding categories...');
  const catMap = [];
  for (const cat of INITIAL_CATEGORIES) {
    const res = await fetch(`${BASE_URL}/BIT240023_DishCategory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const created = await res.json();
    console.log('Created category:', created.id, created.BIT240023_Name);
    catMap.push(created.id);
  }

  const INITIAL_DISHES = [
    {
      BIT240023_Name: 'Fresh Spring Rolls (Gỏi Cuốn Tôm Thịt)',
      BIT240023_Price: 45000,
      BIT240023_PreparationTime: 10,
      BIT240023_IsAvailable: true,
      BIT240023_Description: 'Fresh rice paper rolls with prawns, tender pork belly, fresh herbs and peanut hoisin dipping sauce.',
      BIT240023_DishCategoryId: catMap[0],
      BIT240023_DishImage: [
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: true,
        },
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: false,
        },
      ],
    },
    {
      BIT240023_Name: 'Crispy Fried Spring Rolls (Nem Rán Giòn)',
      BIT240023_Price: 50000,
      BIT240023_PreparationTime: 15,
      BIT240023_IsAvailable: true,
      BIT240023_Description: 'Golden crispy fried rolls stuffed with minced pork, wood-ear mushroom, vermicelli, and sweet-sour garlic chili dip.',
      BIT240023_DishCategoryId: catMap[0],
      BIT240023_DishImage: [
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: true,
        },
      ],
    },
    {
      BIT240023_Name: 'Hanoi Beef Pho (Phở Bò Tái Nạm)',
      BIT240023_Price: 75000,
      BIT240023_PreparationTime: 25,
      BIT240023_IsAvailable: true,
      BIT240023_Description: 'Signature Hanoi style beef noodle soup simmered with bone marrow, star anise, cinnamon, served with fresh herbs.',
      BIT240023_DishCategoryId: catMap[1],
      BIT240023_DishImage: [
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: true,
        },
      ],
    },
    {
      BIT240023_Name: 'Grilled Pork Rice Noodles (Bún Chả Hà Nội)',
      BIT240023_Price: 65000,
      BIT240023_PreparationTime: 12,
      BIT240023_IsAvailable: true,
      BIT240023_Description: 'Charcoal grilled pork patties and marinated sliced pork in seasoned fish sauce broth, served with fresh vermicelli and greens.',
      BIT240023_DishCategoryId: catMap[1],
      BIT240023_DishImage: [
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: true,
        },
      ],
    },
    {
      BIT240023_Name: 'Special Vietnamese Sandwich (Bánh Mì Đặc Biệt)',
      BIT240023_Price: 40000,
      BIT240023_PreparationTime: 8,
      BIT240023_IsAvailable: false,
      BIT240023_Description: 'Crispy baguette layered with chicken liver pate, Vietnamese ham, roasted pork, pickled daikon, carrots and fresh cilantro.',
      BIT240023_DishCategoryId: catMap[1],
      BIT240023_DishImage: [
        {
          BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80',
          BIT240023_IsThumbnail: true,
        },
      ],
    },
  ];

  console.log('Seeding dishes...');
  for (const dish of INITIAL_DISHES) {
    const res = await fetch(`${BASE_URL}/BIT240023_Dish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dish),
    });
    const created = await res.json();
    console.log('Created dish:', created.id, created.BIT240023_Name);
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
