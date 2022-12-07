module.exports.setLang = function setLang(item, lang, virtuals, convertPrice, price) {
    let fee = item.fee;
    if (!fee) {
        fee = 30;
    }
    if (convertPrice) {
        if (lang != null) {
            item.setLanguage(lang);
        }

        if (item.price) {
            let priceWithoutWage = parseFloat(item.price / price);
            let wage = parseFloat(fee * priceWithoutWage / 100);

            item.price = parseFloat(priceWithoutWage + wage).toFixed(2);
        }
        return item.toJSON({ virtuals });

    } else {
        item.setLanguage(lang);
        return item.toJSON({ virtuals });
    }

}

module.exports.setLangs = (array, lang = 'ar', virtuals, convertPrice = false, price = 0) => {
    let arrayWithLang = [];
    for (item of array) {
        arrayWithLang.push(this.setLang(item, lang, virtuals, convertPrice, price));
    }

    return arrayWithLang;
}

module.exports.convertPriceArray = (array, price = 0) => {
    let arrayWithPrice = [];
    for (item of array) {
        arrayWithPrice.push(this.convertPrice(item, price));
    }

    return arrayWithPrice;
}
module.exports.convertPrice = (item, price = 0) => {
    let fee = item.fee;
    if (!fee) {
        fee = 30;
    }

    if (item.productType && item.productType === "variations") {
        item.variations.forEach(element => {
            let priceWithoutWage = parseFloat(element.price / price);
            let wage = parseFloat(fee * priceWithoutWage / 100);
            element.price = parseFloat(priceWithoutWage + wage).toFixed(2);
        });
    }
    if (item.price) {
        let priceWithoutWage = parseFloat(item.price / price);
        let wage = parseFloat(fee * priceWithoutWage / 100);
        item.price = parseFloat(priceWithoutWage + wage).toFixed(2);
    }
    return item;

}

module.exports.convertPriceArrayOrder = (array, price = 0) => {
    let arrayWithPrice = [];
    for (item of array) {
        arrayWithPrice.push(this.convertPriceOrder(item, price));
    }

    return arrayWithPrice;
}

module.exports.convertPriceOrder = (item, price = 0) => {
    let fee = item.product.fee;
    if (!fee) {
        fee = 30;
    }
    if (item.product.productType && item.product.productType === "variations") {
        item.product.variations.forEach(element => {
            let priceWithoutWage = parseFloat(element.price / price);
            let wage = parseFloat(fee * priceWithoutWage / 100);
            element.priceIR = element.price;

            element.price = parseFloat(priceWithoutWage + wage).toFixed(2);
        });
    }
    if (item.product.price) {
        let priceWithoutWage = parseFloat(item.product.price / price).toFixed(2);
        let wage = fee * 100 / priceWithoutWage;
        item.product.priceIR = item.product.price;
        item.product.price = parseFloat(priceWithoutWage + wage).toFixed(2);
    }
    if (item.product.postalAmount) {
        item.product.postalAmount = parseFloat(item.product.postalAmount / price).toFixed(2);

    }
    return item;

}