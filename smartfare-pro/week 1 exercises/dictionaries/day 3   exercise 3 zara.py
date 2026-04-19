# Exercise 3: Zara - Dictionary Manipulation


brand = {
    "name": "Zara",
    "creation_date": 1975,
    "creator_name": "Amancio Ortega Gaona",
    "type_of_clothes": ["men", "women", "children", "home"],
    "international_competitors": ["Gap", "H&M", "Benetton"],
    "number_stores": 7000,
    "major_color": {
        "France": ["blue"],
        "Spain": ["red"],
        "US": ["pink", "green"]
    }
}

print("=" * 50)
print("EXERCISE 3: ZARA")
print("=" * 50)

brand["number_stores"] = 2
print(f"\n1. Changed number_stores to: {brand['number_stores']}")
#sentence describing Zara's clients
print(f"\n2. Zara's clients: Zara offers clothing for {', '.join(brand['type_of_clothes'])}.")


brand["country_creation"] = "Spain"
print(f"\n3. Added country_creation: {brand['country_creation']}")

# 4. Check if international_competitors exists and add "Desigual"
if "international_competitors" in brand:
    brand["international_competitors"].append("Desigual")
    print(f"\n4. Added 'Desigual' to competitors: {brand['international_competitors']}")

# 5. Delete creation_date key
del brand["creation_date"]
print("\n5. Deleted creation_date key")

# 6.last item in international_competitors
last_competitor = brand["international_competitors"][-1]
print(f"\n6. Last competitor: {last_competitor}")

# 7.major colors in the US
us_colors = brand["major_color"]["US"]
print(f"\n7. Major colors in the US: {', '.join(us_colors)}")

# 8.number of keys in the dictionary
num_keys = len(brand)
print(f"\n8. Number of keys in the dictionary: {num_keys}")

# 9. Print all keys
print(f"\n9. All keys in the dictionary: {list(brand.keys())}")

# BONUS: Creating another dictionary and merging
print("\n" + "=" * 50)
print("BONUS: MERGING DICTIONARIES")
print("=" * 50)

more_on_zara = {
    "creation_date": 1975,
    "number_stores": 7000
}

print(f"\nOriginal brand keys: {list(brand.keys())}")
print(f"New dictionary: {more_on_zara}")

# Merging using update()
brand.update(more_on_zara)

print(f"\nMerged dictionary: {brand}")
print(f"Final keys after merge: {list(brand.keys())}")
