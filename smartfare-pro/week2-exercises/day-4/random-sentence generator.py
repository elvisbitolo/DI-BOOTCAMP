import random

# Step 1: Read words from file
def get_words_from_file(filepath):
    try:
        with open(filepath, "r") as file:
            content = file.read()
            words = content.split()
            return words
    except FileNotFoundError:
        print("Error: File not found.")
        return []


# Step 2: Generate random sentence
def get_random_sentence(length, filepath):
    words = get_words_from_file(filepath)

    if not words:
        return "No words available."

    sentence = [random.choice(words) for _ in range(length)]
    return " ".join(sentence).lower()


# Step 3: Main function
def main():
    print("🔤 Random Sentence Generator")
    print("Generate a random sentence from a word list.")

    user_input = input("Enter sentence length (2–20): ")

    try:
        length = int(user_input)

        if length < 2 or length > 20:
            print("Error: Length must be between 2 and 20.")
            return

        sentence = get_random_sentence(length, "words.txt")
        print("\nGenerated sentence:")
        print(sentence)

    except ValueError:
        print("Error: Please enter a valid integer.")


# Run program
if __name__ == "__main__":
    main()