import random

# =========================
# Exercise 1: What Are You Learning?
# =========================
def display_message():
    print("I am learning about functions in Python.")

display_message()


# =========================
# Exercise 2: What's Your Favorite Book?
# =========================
def favorite_book(title):
    print(f"One of my favorite books is {title}.")

favorite_book("Alice in Wonderland")


# =========================
# Exercise 3: Some Geography
# =========================
def describe_city(city, country="Unknown"):
    print(f"{city} is in {country}.")

describe_city("Reykjavik", "Iceland")
describe_city("Paris")


# =========================
# Exercise 4: Random Number Comparison
# =========================
def compare_random_number(user_number):
    random_number = random.randint(1, 100)
    if user_number == random_number:
        print("Success!")
    else:
        print(f"Fail! Your number: {user_number}, Random number: {random_number}")

compare_random_number(50)  # Example call


# =========================
# Exercise 5: Personalized Shirts
# =========================
def make_shirt(size="large", text="I love Python"):
    print(f"The size of the shirt is {size} and the text is {text}.")

# Default and custom examples
make_shirt()  # large with default message
make_shirt("medium")  # medium with default message
make_shirt("small", "Custom message")  # small with custom message
make_shirt(size="extra large", text="Hello World")  # using keyword arguments


# =========================
# Exercise 6: Magicians
# =========================
magician_names = ['Harry Houdini', 'David Blaine', 'Criss Angel']

def show_magicians(names):
    for name in names:
        print(name)

def make_great(names):
    for i in range(len(names)):
        names[i] = names[i] + " the Great"

make_great(magician_names)
show_magicians(magician_names)


# =========================
# Exercise 7: Temperature Advice
# =========================
def get_random_temp():
    return round(random.uniform(-10, 40), 1)  # floating point temperature

def main():
    temp = get_random_temp()
    print(f"The temperature right now is {temp} degrees Celsius.")
    
    if temp < 0:
        print("Brrr, that’s freezing! Wear some extra layers today.")
    elif 0 <= temp <= 16:
        print("Quite chilly! Don’t forget your coat.")
    elif 16 < temp <= 23:
        print("Nice weather.")
    elif 23 < temp <= 32:
        print("A bit warm, stay hydrated.")
    else:  # 32 < temp <= 40
        print("It’s really hot! Stay cool.")

main()
