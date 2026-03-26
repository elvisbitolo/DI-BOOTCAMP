# Exercise 1: Cars - String to List Manipulation

# 1. Copy the string and convert to a list
cars_string = "Volkswagen, Toyota, Ford Motor, Honda, Chevrolet"
cars_list = [car.strip() for car in cars_string.split(",")]

print("=" * 70)
print("EXERCISE 1: CARS")
print("=" * 70)

print(f"\nOriginal string: {cars_string}")
print(f"\nCars list: {cars_list}")

# 2. Print how many manufacturers are in the list
print(f"\nNumber of manufacturers: {len(cars_list)}")

# 3. Print the list in reverse order (Z-A)
reversed_list = cars_list[::-1]
print(f"\nManufacturers in reverse order (Z-A): {reversed_list}")

# 4. Find how many manufacturers have the letter 'o' in their name
cars_with_o = [car for car in cars_list if 'o' in car.lower()]
count_with_o = len(cars_with_o)
print(f"\nManufacturers with 'o' in their name: {cars_with_o}")
print(f"Count: {count_with_o}")

# 5. Find how many manufacturers do NOT have the letter 'i' in their name
cars_without_i = [car for car in cars_list if 'i' not in car.lower()]
count_without_i = len(cars_without_i)
print(f"\nManufacturers WITHOUT 'i' in their name: {cars_without_i}")
print(f"Count: {count_without_i}")

# BONUS 1: Remove duplicates from a list with duplicates
print("\n" + "=" * 70)
print("BONUS 1: REMOVING DUPLICATES")
print("=" * 70)

cars_with_duplicates = ["Honda", "Volkswagen", "Toyota", "Ford Motor", "Honda", "Chevrolet", "Toyota"]
print(f"\nOriginal list with duplicates: {cars_with_duplicates}")

cars_without_duplicates = list(dict.fromkeys(cars_with_duplicates))
print(f"List without duplicates: {cars_without_duplicates}")

cars_string_no_dupes = ", ".join(cars_without_duplicates)
print(f"\nCompanies without duplicates (as string): {cars_string_no_dupes}")
print(f"Number of companies without duplicates: {len(cars_without_duplicates)}")

# BONUS 2: 
print("\n" + "=" * 70)
print("BONUS 2: SORTED MANUFACTURERS WITH REVERSED LETTERS")
print("=" * 70)

sorted_cars = sorted(cars_list)
reversed_letters = [car[::-1] for car in sorted_cars]

print(f"\nManufacturers in ascending order (A-Z):")
for i, (original, reversed_name) in enumerate(zip(sorted_cars, reversed_letters), 1):
    print(f"  {i}. {original} → {reversed_name}")

# Or as a single line:
print("\nAs a list:", reversed_letters)
