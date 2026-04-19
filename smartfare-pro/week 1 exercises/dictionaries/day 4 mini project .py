import random

# 1. Ask for user input
user_string = input("Enter a string (exactly 10 characters): ")

# 2. Check length
if len(user_string) < 10:
    print("String not long enough.")
elif len(user_string) > 10:
    print("String too long.")
else:
    print("Perfect string")

    # 3. Print first and last characters
    print("First character:", user_string[0])
    print("Last character:", user_string[-1])

    # 4. Build string character by character
    print("\nBuilding string:")
    for i in range(len(user_string)):
        print(user_string[:i+1])

    # 5. Bonus: Jumble the string
    char_list = list(user_string)   # convert string to list
    random.shuffle(char_list)       # shuffle the list
    jumbled = "".join(char_list)    # convert back to string

    print("\nJumbled string:", jumbled)
