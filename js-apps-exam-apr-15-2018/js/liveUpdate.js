$(() => {
    $('#create-entry-form input').on('change paste keyup', update)
    let subtotal = $('#create-entry-form').find('div').eq(3);
    let grossTotal = $('#create-receipt-form').find('div').eq(3);
    let originalTotal = parseFloat(grossTotal.text());

    function update() {

        let total = parseFloat($('input[name=qty]').val()) * parseFloat($('input[name=price]').val())
        if (isNaN(total)) {
            subtotal.text('--.--')
            grossTotal.text(originalTotal.toFixed(2))
        }
        else {
            subtotal.text(total.toFixed(2))
            grossTotal.text((originalTotal + total).toFixed(2))
        }
    }
})