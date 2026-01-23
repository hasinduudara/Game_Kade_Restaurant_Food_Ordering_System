const burgerImg = require('../assets/images/burger.png');

export const categories = [
    { id: 1, name: 'Rice', icon: 'restaurant' },
    { id: 2, name: 'Kottu', icon: 'fast-food' },
    { id: 3, name: 'Burgers', icon: 'nutrition' },
    { id: 4, name: 'Drinks', icon: 'beer' },
];

export const foodItems = [
    {
        id: 1,
        name: 'Chicken Fried Rice',
        price: 'Rs. 1200',
        rating: 4.8,
        image: burgerImg,
        description: 'Spicy Sri Lankan style fried rice with chili paste.'
    },
    {
        id: 2,
        name: 'Cheese Kottu',
        price: 'Rs. 1500',
        rating: 4.9,
        image: burgerImg,
        description: 'Creamy cheese kottu with roast chicken.'
    },
    {
        id: 3,
        name: 'Double Burger',
        price: 'Rs. 950',
        rating: 4.5,
        image: burgerImg,
        description: 'Double patty burger with extra cheese.'
    }
];