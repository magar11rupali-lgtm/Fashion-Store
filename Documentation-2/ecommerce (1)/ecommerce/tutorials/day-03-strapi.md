# Day 3: Setting Up Strapi Backend & Creating Product Model

## 🎯 Learning Objectives

By the end of today, you will:
- Understand what a CMS (Content Management System) is
- Learn about databases and data models
- Create product structure in Strapi
- Add sample products to your database

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 3.1: Explore Strapi Admin Panel

**Subtask 3.1.1: Start Strapi server**

```bash
cd backend
npm run develop
```

Browser should automatically open to `http://localhost:1337/admin`

**Subtask 3.1.2: Create admin account**

Fill in the form:
- **First name**: Your first name
- **Last name**: Your last name
- **Email**: Your email (can be fake for learning)
- **Password**: Create a strong password
- **Confirm password**: Same password

⚠️ **IMPORTANT**: Save these credentials! Write them down!

**Subtask 3.1.3: Explore Content-Type Builder**

1. Click "Content-Type Builder" in the left sidebar
2. This is where you create data structures
3. You'll see two options:
   - **Collection Types**: Multiple items (like products)
   - **Single Types**: One item (like homepage settings)

**Subtask 3.1.4: Understand Collections vs Single Types**

- **Collection Type**: Use for products, blog posts, reviews (many items)
- **Single Type**: Use for about page, settings (one item)

---

### Task 3.2: Create Product Content Type

**Subtask 3.2.1: Click "Create new collection type"**

1. In Content-Type Builder, click "+ Create new collection type"
2. Display name: `Product`
3. Click "Continue"

**Subtask 3.2.2: Name it "Product"**

- The API ID will automatically be `product`
- Click "Continue"

**Subtask 3.2.3: Add text fields**

Click "Add another field" and add these fields:

**Field 1: Product Name**
- Type: **Text**
- Name: `name`
- Type: **Short text**
- ✅ Check "Required field"
- Click "Finish"

**Field 2: Description**
- Click "Add another field"
- Type: **Rich text**
- Name: `description`
- ✅ Check "Required field"
- Click "Finish"

**Subtask 3.2.4: Add number and other fields**

**Field 3: Price**
- Click "Add another field"
- Type: **Number**
- Name: `price`
- Number format: **Decimal (ex: 2.22)**
- ✅ Check "Required field"
- Click "Finish"

**Field 4: Category**
- Click "Add another field"
- Type: **Text**
- Name: `category`
- Type: **Short text**
- Click "Finish"

**Field 5: Image**
- Click "Add another field"
- Type: **Media**
- Name: `image`
- Type: **Single media**
- ✅ Check "Required field"
- Click "Finish"

**Field 6: In Stock**
- Click "Add another field"
- Type: **Boolean**
- Name: `inStock`
- Default value: **true**
- Click "Finish"

**Subtask 3.2.5: Save and restart**

1. Click "Save" button (top right)
2. Wait for Strapi to restart (30 seconds)
3. You should see "Product" in the left sidebar now!

---

### Task 3.3: Create Category Content Type

**Subtask 3.3.1: Create "Category" collection**

1. Go back to Content-Type Builder
2. Click "+ Create new collection type"
3. Display name: `Category`
4. Click "Continue"

**Subtask 3.3.2: Add fields**

**Field 1: Name**
- Type: **Text**
- Name: `name`
- Type: **Short text**
- ✅ Check "Required field"
- Click "Finish"

**Field 2: Description**
- Type: **Text**
- Name: `description`
- Type: **Long text**
- Click "Finish"

**Field 3: Icon**
- Type: **Media**
- Name: `icon`
- Type: **Single media**
- Click "Finish"

**Subtask 3.3.3: Create relation**

1. Click "Add another field"
2. Type: **Relation**
3. Select: Category **has many** Products
4. Click "Finish"

**Subtask 3.3.4: Save and restart**

1. Click "Save"
2. Wait for restart

---

### Task 3.4: Add Sample Products

**Subtask 3.4.1: Navigate to Content Manager**

1. Click "Content Manager" in left sidebar
2. Click "Product" under Collection Types
3. Click "+ Create new entry"

**Subtask 3.4.2: Add first product**

Fill in the form:
- **Name**: Classic White T-Shirt
- **Description**: Comfortable cotton t-shirt perfect for everyday wear
- **Price**: 29.99
- **Category**: T-Shirts
- **Image**: Click "Add new assets" and upload an image
- **InStock**: ✅ (checked)

Click "Save" then "Publish"

**Subtask 3.4.3: Add more products**

Create at least 5 products. Here are suggestions:

**Product 2:**
- Name: Blue Denim Jeans
- Description: Classic fit jeans with comfortable stretch
- Price: 79.99
- Category: Jeans
- Image: Upload jeans image
- InStock: ✅

**Product 3:**
- Name: Summer Floral Dress
- Description: Light and breezy dress perfect for summer
- Price: 59.99
- Category: Dresses
- Image: Upload dress image
- InStock: ✅

**Product 4:**
- Name: Leather Sneakers
- Description: Stylish sneakers for casual outings
- Price: 89.99
- Category: Shoes
- Image: Upload shoes image
- InStock: ✅

**Product 5:**
- Name: Wool Winter Coat
- Description: Warm and elegant coat for cold weather
- Price: 149.99
- Category: Outerwear
- Image: Upload coat image
- InStock: ❌ (unchecked)

**Subtask 3.4.4: Publish all products**

Make sure each product is **Published** (not just saved as draft)

---

### Task 3.5: Set API Permissions

**IMPORTANT**: This allows your frontend to access the data!

**Subtask 3.5.1: Go to Settings**

1. Click "Settings" in left sidebar (bottom)
2. Under "Users & Permissions Plugin", click "Roles"
3. Click "Public"

**Subtask 3.5.2: Enable Product permissions**

Scroll down to "Product":
- ✅ Check **find** (get all products)
- ✅ Check **findOne** (get single product)

**Subtask 3.5.3: Enable Category permissions**

Scroll down to "Category":
- ✅ Check **find**
- ✅ Check **findOne**

**Subtask 3.5.4: Save**

Click "Save" button (top right)

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"What is a CMS and why do we need it for e-commerce?"

"Explain Strapi content types in simple words"

"What fields should a fashion product have in a database?"

"How do I create a relationship between two content types in Strapi?"

"Help me: I can't see my products in Strapi"

"Why do I need to set API permissions in Strapi?"

"How do I upload images to Strapi?"
```

---

## 📖 Tutorial Steps

### Step-by-Step: Creating Product Content Type

1. **Start Strapi**
   ```bash
   cd backend
   npm run develop
   ```

2. **Login to Admin Panel**
   - Go to `http://localhost:1337/admin`
   - Enter your credentials

3. **Open Content-Type Builder**
   - Click "Content-Type Builder" in sidebar

4. **Create Collection Type**
   - Click "+ Create new collection type"
   - Enter "Product"
   - Click "Continue"

5. **Add Each Field**
   - Follow the field specifications above
   - Click "Add another field" for each new field
   - Click "Finish" after each field

6. **Save**
   - Click "Save" button
   - Wait for restart

### Step-by-Step: Adding Products

1. **Open Content Manager**
   - Click "Content Manager" in sidebar

2. **Select Product**
   - Click "Product" under Collection Types

3. **Create New Entry**
   - Click "+ Create new entry"

4. **Fill Form**
   - Enter all product details
   - Upload image

5. **Publish**
   - Click "Save"
   - Click "Publish"

6. **Repeat**
   - Add at least 5 products

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Strapi admin panel opens successfully
- [ ] Admin account created and saved
- [ ] Product content type exists with all 6 fields
- [ ] Category content type exists
- [ ] At least 5 products created
- [ ] All products have images
- [ ] All products are published (not draft)
- [ ] API permissions set for Public role
- [ ] Can access: `http://localhost:1337/api/products`
- [ ] Can access: `http://localhost:1337/api/categories`

### Test Your API

Open these URLs in your browser:

```
http://localhost:1337/api/products
http://localhost:1337/api/categories
```

You should see JSON data with your products!

---

## 🎨 Understanding the Data Structure

### Product Model

```
Product {
  id: number
  name: string
  description: text
  price: decimal
  category: string
  image: file
  inStock: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

### API Response Example

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Classic White T-Shirt",
        "description": "Comfortable cotton t-shirt",
        "price": 29.99,
        "category": "T-Shirts",
        "inStock": true,
        "image": {
          "data": {
            "attributes": {
              "url": "/uploads/tshirt.jpg"
            }
          }
        }
      }
    }
  ]
}
```

---

## 🏠 Homework

Before Day 4, complete these tasks:

1. **Add 10 fashion products** with real descriptions
   - Make them diverse (different categories)
   - Use quality images
   - Set realistic prices

2. **Create 3 categories**
   - Men
   - Women
   - Accessories

3. **Find and upload quality product images**
   - Use [Unsplash](https://unsplash.com) or [Pexels](https://pexels.com)
   - Search for "fashion", "clothing", specific items
   - Download and upload to Strapi

4. **Experiment with Strapi**
   - Try editing a product
   - Try deleting a product (then add it back)
   - Explore other Strapi features

---

## 🐛 Common Errors & Solutions

### Error: Can't access admin panel
**Solution:** Make sure Strapi is running (`npm run develop`)

### Error: "This attribute must be unique"
**Solution:** Product names must be different. Change the name.

### Error: Can't upload images
**Solution:** 
- Check image file size (should be < 10MB)
- Use common formats (JPG, PNG)
- Make sure image is not corrupted

### Error: API returns empty array
**Solution:**
- Make sure products are **Published** (not draft)
- Check API permissions are set correctly
- Restart Strapi

### Error: "Forbidden" when accessing API
**Solution:**
- Go to Settings → Roles → Public
- Enable find and findOne permissions
- Save

---

## 📚 What You Learned Today

- ✅ What a CMS is and why it's useful
- ✅ How to create content types in Strapi
- ✅ Different field types (text, number, media, boolean)
- ✅ How to create relationships between content types
- ✅ How to add and manage content
- ✅ How to set API permissions
- ✅ How to test API endpoints

---

## 💡 Key Concepts

### Content Management System (CMS)
A CMS is like a control panel for your website's content. Instead of coding every product, you can add them through a user-friendly interface.

### Content Types
Think of content types as templates. A "Product" content type is like a form that says "every product needs a name, price, image, etc."

### API (Application Programming Interface)
An API is how your frontend (Next.js) talks to your backend (Strapi). It's like a waiter taking orders from customers (frontend) to the kitchen (backend).

### Permissions
Permissions control who can access your data. "Public" means anyone can view (but not edit) your products.

---

## 🎉 Congratulations!

You've completed Day 3! You now have a fully functional backend with products stored in a database. Your e-commerce site is really taking shape!

**Tomorrow:** We'll connect the frontend to the backend and display products on your website!

---

## 📖 Additional Reading (Optional)

- [Strapi Documentation](https://docs.strapi.io)
- [Understanding REST APIs](https://www.redhat.com/en/topics/api/what-is-a-rest-api)
- [Database Basics](https://www.oracle.com/database/what-is-database/)

---

[← Day 2: Homepage](./day-02-homepage.md) | [Back to Overview](./README.md) | [Day 4: API Integration →](./day-04-api-integration.md)
