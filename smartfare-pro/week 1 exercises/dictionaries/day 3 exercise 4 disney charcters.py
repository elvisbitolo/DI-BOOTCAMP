# Exercise 4: Disney Characters - Dictionary Creation and Sorting

users = ["Mickey", "Minnie", "Donald", "Ariel", "Pluto"]

print("=" * 60)
print("EXERCISE 4: DISNEY CHARACTERS")
print("=" * 60)

# 1. Create a dictionary that maps characters to their indices
character_to_index = {char: index for index, char in enumerate(users)}
print("\n1. Characters mapped to indices:")
print(character_to_index)

# 2. Create a dictionary that maps indices to characters
index_to_character = {index: char for index, char in enumerate(users)}
print("\n2. Indices mapped to characters:")
print(index_to_character)

# 3. Create a dictionary with sorted characters mapped to new indices
sorted_users = sorted(users)
sorted_character_to_index = {char: index for index, char in enumerate(sorted_users)}
print("\n3. Sorted characters mapped to new indices:")
print(sorted_character_to_index)


print("\n" + "=" * 60)
