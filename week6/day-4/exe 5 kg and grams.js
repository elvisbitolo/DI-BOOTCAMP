function kgToGrams(kg) {
    return kg * 1000;
}
console.log(kgToGrams(2));
const kgToGramsExp = function(kg) {
    return kg * 1000;
};
console.log(kgToGramsExp(2));
const kgToGramsArrow = kg => kg * 1000;
console.log(kgToGramsArrow(2));
// Declaration is hoisted, expression is not