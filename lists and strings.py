# Challenge 1:
number = int(input("Enter a number: "))
length = int(input("Enter the length: "))

multiples = []

for i in range(1, length + 1):
    multiples.append(number * i)

print("Multiples:", multiples)
# Challenge 2: Remove Consecutive Duplicate Letters

word = input("Enter a word: ")

if word:
    result = word[0]

    for char in word[1:]:
        if char != result[-1]:
            result += char

    print("Processed word:", result)
else:
    print("Processed word: ")
