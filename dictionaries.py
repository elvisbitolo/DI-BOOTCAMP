# =========================
# Challenge 1: Letter Index Dictionary
# =========================

# Step 1: Get user input
word = input("Enter a word: ")

# Step 2: Create an empty dictionary to store letters and their indices
letter_indices = {}

# Step 3: Loop through each character and its index
for index, char in enumerate(word):
    if char in letter_indices:
        # If the character already exists, append the new index
        letter_indices[char].append(index)
    else:
        # If it's a new character, create a new list with the current index
        letter_indices[char] = [index]

# Step 4: Print the result
print("Letter Index Dictionary:", letter_indices)

# =========================
# Challenge 2: Affordable Items
# =========================

# Example dictionary of items and their prices
items_purchase = {"Water": "$1", "Bread": "$3", "TV": "$1,000", "Fertilizer": "$20"}
wallet = "$300"

# Step 1: Convert wallet to an integer
wallet_amount = int(wallet.replace("$", "").replace(",", ""))

# Step 2: Create basket list
basket = []

# Step 3: Iterate through the items in the dictionary
for item, price in items_purchase.items():
    # Clean the price string and convert to integer
    price_amount = int(price.replace("$", "").replace(",", ""))
    
    # Check if wallet can cover the price
    if wallet_amount >= price_amount:
        basket.append(item)        # Add item to basket
        wallet_amount -= price_amount  # Deduct the price from wallet

# Step 4: Print results
if basket:
    print("Affordable Items:", sorted(basket))  # Alphabetical order
else:
    print("Affordable Items: Nothing")
