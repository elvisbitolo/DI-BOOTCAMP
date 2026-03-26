# ==============================
# Exercise 1: Favorite Numbers (Sets)
# ==============================
my_fav_numbers = {3, 7, 21}
my_fav_numbers.add(42)
my_fav_numbers.add(99)
my_fav_numbers.remove(99)  # Remove last added number

friend_fav_numbers = {5, 7, 11}
our_fav_numbers = my_fav_numbers.union(friend_fav_numbers)
print("Our favorite numbers:", our_fav_numbers)


# ==============================
# Exercise 2: Tuple (Immutability)
# ==============================
my_tuple = (1, 2, 3)
# Tuples are immutable; we cannot do my_tuple.append(4)
# Instead, we can create a new tuple:
new_tuple = my_tuple + (4, 5)
print("Original tuple:", my_tuple)
print("New tuple after adding numbers:", new_tuple)


# ==============================
# Exercise 3: List Manipulation
# ==============================
basket = ["Banana", "Apples", "Oranges", "Blueberries"]
basket.remove("Banana")
basket.remove("Blueberries")
basket.append("Kiwi")
basket.insert(0, "Apples")
apples_count = basket.count("Apples")
print("Basket after modifications:", basket)
print("Number of Apples in basket:", apples_count)
basket.clear()
print("Basket after clearing:", basket)


# ==============================
# Exercise 4: Floats and Integers
# ==============================
numbers = [i/2 for i in range(3, 11)]  # 1.5,2,2.5,...5
print("Mixed numbers list:", numbers)


# ==============================
# Exercise 5: For Loops
# ==============================
print("Numbers 1 to 20:")
for i in range(1, 21):
    print(i, end=' ')
print("\nEven indexed numbers 1 to 20:")
for i in range(1, 21):
    if i % 2 == 0:
        print(i, end=' ')
print()


# ==============================
# Exercise 6: While Loop for Name Validation
# ==============================
while True:
    name = input("Enter your name: ")
    if len(name) >= 3 and not name.isdigit():
        print("Thank you!")
        break
    else:
        print("Please enter a valid name (at least 3 letters, not digits).")


# ==============================
# Exercise 7: Favorite Fruits
# ==============================
fav_fruits = input("Enter your favorite fruits (separated by spaces): ").split()
fruit_choice = input("Pick a fruit: ")
if fruit_choice in fav_fruits:
    print("You chose one of your favorite fruits! Enjoy!")
else:
    print("You chose a new fruit. I hope you enjoy it!")


# ==============================
# Exercise 8: Pizza Toppings
# ==============================
toppings = []
while True:
    topping = input("Enter a pizza topping (type 'quit' to stop): ").lower()
    if topping == "quit":
        break
    toppings.append(topping)
    print(f"Adding {topping} to your pizza.")

base_price = 10
total_price = base_price + len(toppings) * 2.5
print("Your pizza toppings:", toppings)
print(f"Total cost: ${total_price:.2f}")


# ==============================
# Exercise 9: Cinemax Tickets
# ==============================
ages = input("Enter the ages of your family members (space separated): ").split()
ages = [int(age) for age in ages]

total_cost = 0
for age in ages:
    if age < 3:
        price = 0
    elif 3 <= age <= 12:
        price = 10
    else:
        price = 15
    total_cost += price

print(f"Total ticket cost: ${total_cost}")


# ==============================
# Bonus: Restricted Movie (16-21)
# ==============================
teen_ages = input("Enter ages of teenagers for restricted movie: ").split()
teen_ages = [int(age) for age in teen_ages]

allowed_teens = [age for age in teen_ages if 16 <= age <= 21]
print("Allowed attendees:", allowed_teens)
