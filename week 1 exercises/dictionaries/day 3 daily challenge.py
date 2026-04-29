# Day 3 Daily Challenge

# ============================================================================
# CHALLENGE 1: Letter Index Dictionary
# ============================================================================

print("=" * 70)
print("CHALLENGE 1: LETTER INDEX DICTIONARY")
print("=" * 70)

def create_letter_index_dict():
    
    user_word = input("\nEnter a word: ").lower()
    
    letter_indices = {}
    
    for index, letter in enumerate(user_word):
        if letter in letter_indices:
           
            letter_indices[letter].append(index)
        else:
            
            letter_indices[letter] = [index]
    
    print(f"Result: {letter_indices}")
    return letter_indices


# Testing the function 
print("\nTest Examples:")
print("For 'dodo': {'d': [0, 2], 'o': [1, 3]}")
print("For 'froggy': {'f': [0], 'r': [1], 'o': [2], 'g': [3, 4], 'y': [5]}")
print("For 'grapes': {'g': [0], 'r': [1], 'a': [2], 'p': [3], 'e': [4], 's': [5]}")

print("\nUncomment the line below to run the interactive version:")
print("# create_letter_index_dict()")


# ============================================================================
# CHALLENGE 2: Affordable Items
# ============================================================================

print("\n" + "=" * 70)
print("CHALLENGE 2: AFFORDABLE ITEMS")
print("=" * 70)

def get_affordable_items(items_purchase, wallet):
    
    
    # Clean the wallet: remove $ and commas, convert to int
    wallet_amount = int(wallet.replace("$", "").replace(",", ""))
    
    basket = []
    
    # Loop through items in order of priority
    for item, price_str in items_purchase.items():
        # Clean the price: remove $ and commas, convert to int
        item_price = int(price_str.replace("$", "").replace(",", ""))
        
        # Check if we can afford this item
        if wallet_amount >= item_price:
            basket.append(item)
            wallet_amount -= item_price  # Update wallet after purchase
    
    # Return results
    if not basket:
        return "Nothing"
    else:
        return sorted(basket)


# Test Example 1
print("\nTest Example 1:")
items_purchase_1 = {"Water": "$1", "Bread": "$3", "TV": "$1,000", "Fertilizer": "$20"}
wallet_1 = "$300"
result_1 = get_affordable_items(items_purchase_1, wallet_1)
print(f"Items: {items_purchase_1}")
print(f"Wallet: {wallet_1}")
print(f"Result: {result_1}")
print(f"Expected: ['Bread', 'Fertilizer', 'Water']")

# Test Example 2
print("\nTest Example 2:")
items_purchase_2 = {"Apple": "$4", "Honey": "$3", "Fan": "$14", "Bananas": "$4", "Pan": "$100", "Spoon": "$2"}
wallet_2 = "$100"
result_2 = get_affordable_items(items_purchase_2, wallet_2)
print(f"Items: {items_purchase_2}")
print(f"Wallet: {wallet_2}")
print(f"Result: {result_2}")
print(f"Expected: ['Apple', 'Bananas', 'Fan', 'Honey', 'Spoon']")

# Test Example 3
print("\nTest Example 3:")
items_purchase_3 = {"Phone": "$999", "Speakers": "$300", "Laptop": "$5,000", "PC": "$1200"}
wallet_3 = "$1"
result_3 = get_affordable_items(items_purchase_3, wallet_3)
print(f"Items: {items_purchase_3}")
print(f"Wallet: {wallet_3}")
print(f"Result: {result_3}")
print(f"Expected: Nothing")
