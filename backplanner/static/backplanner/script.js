window.onload = function() {

    $('#howItWorksExpand').on('click', (e)=>{
        let $unit = $('#howItWorksExpand');
        if ($unit.hasClass('bi-arrow-down-square')) {
            $unit.removeClass('bi-arrow-down-square').addClass('bi-arrow-up-square');
        } else {
            $unit.removeClass('bi-arrow-up-square').addClass('bi-arrow-down-square'); 
        }
    });

    $('#targetWeight').on('blur', (e)=>{
        // confirm contents are numbers, remove 
        if (!$.isNumeric($('#targetWeight').val()) || $('#targetWeight').val() < 0) {
            alert('You must enter a positive number.');
            $('#targetWeight').val('');
            return false;
        }
        // retrieve units
        if ($('input[name="targetUnits"]:checked').val() === "grams") {
            // let grams = document.querySelectorAll('.dash-grams').value();
            console.log($('.dash-grams'));
        }
        // send to db if value is realistic, else alert warning
    });

    $('#create-category').on('keyup', (e)=>{
        if ($('#create-category').val().length > 0) {
            $('#category-submit').prop('disabled', false);
        } else {
            $('#category-submit').prop('disabled', true);
        }
    });

    $('#category-submit').on('click', ()=>{
        let $name = $('#create-category').val();
        let categories = document.querySelectorAll('.category');
        if (categories.length === 0) {
            categoryGen($name);
        } else {
            for (let i=0; i<categories.length; i++) {
                if (categories[i].classList.contains($name)) {
                    alert('This category name already exists. Please select a different name.');
                    $('#create-category').val('');
                    break;
                } else {
                    categoryGen($name);
                }
            }
        } 
    });

    let categoryGen = (name) => {
        let $display = name.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        let $name = name.toLowerCase();

        let $node = `<div class="category card mt-1" id="${$name}"><div class="card-header d-flex justify-content-between" style="background-color: gold;"><span class="h4"><input type="checkbox" class="include-${$name}" checked>${$display}</span><i class="bi bi-x-square ml-1 ${$name}-cat-delete"></i></div><div class="card-body"><table class="table table-hover table-sm"><thead><tr><th>Include</th><th>Item Description</th><th>QTY</th><th>Grams</th><th>Ounces</th><th>Delete</th></tr></thead><tbody class="${$name} tbod"></tbody></table><form class="${$name} item d-flex justify-content-center p-1 border rounded"><div class="mr-1"><span>Create A New Item: </span><input type="text" name="item"></div><div class="mr-1"><span>Quantity: </span><input type="text" name="quantity" size="3"></div><div class="mr-1"><span>Weight: </span><input type="text" min="0" size="5" name="weight"><span>Units: </span><input type="radio" name="units" id="${$name}-grams" value="grams" checked><label for="${$name}-grams"> g</label><input type="radio" name="units" id="${$name}-ounces" value="ounces"><label for="${$name}-ounces"> oz</label></div><input type="submit" value="Create" class="ml-1 btn btn-outline-secondary btn-sm" id="${$name}-item-submit"></form></div></div>`;

        // Animate new section
        $($node).hide().insertBefore('#category-generator').slideDown('slow');
        $('#create-category').val('');
        $('#category-submit').prop('disabled', true);

        // Add delete functionality to categories
        $(`.${$name}-cat-delete`).mouseenter(()=>{$(`.${$name}-cat-delete`).css('color','firebrick')}).mouseleave(()=>{$(`.${$name}-cat-delete`).css('color','black')});
        $(`.${$name}-cat-delete`).on('click', (e) => {
            if (confirm(`Are you sure you want to delete ${$display} from your pack? All items will be lost.`)) {
                console.log('delete the category from the page, and remove all items from db that match the category.');
            } else {
                console.log('do nothing');
            }
        });

        // Update the dashboard
        let $row = (`<tr class="${$name}"><th scope="row">${$display}</th><td class="dash-grams">0</td><td class="dash-oz">0</td><td class="dash-count">0</td></tr>`);
        $($row).appendTo('#category-dash');

        // Add new item on submit; update dashboard; send values to db; add more event listeners
        $(`#${$name}-item-submit`).on('click', (e) => {
            e.preventDefault();
            let catId = document.querySelector(`#${$name}-item-submit`).parentNode.parentNode.parentNode.id
            
            // Build object to send with API
            let x = $(`form.${catId}`).serializeArray();
            let record = {
                include: true,
                category: catId,
            };  

            // Function for rounding numbers
            function round(value, precision) {
                var multiplier = Math.pow(10, precision || 0);
                return Math.round(value * multiplier) / multiplier;
            }

            // populate grams and ounces
            if (x[3].value === "ounces") {
                record.ounces = round(parseFloat(x[2].value),1);
                record.grams = round(x[2].value * 28.35, 1);
            } else if (x[3].value === "grams") {
                record.grams = round(parseFloat(x[2].value),1);
                record.ounces = round(x[2].value * 0.035274, 1);
            }
            // populate remaining fields from form inputs
            x.forEach((item) => {
                if (item.name === "units" || item.name === "weight") {
                    return;
                }
                if (item.name === "quantity") {
                    record[item.name] = parseInt(item.value);
                    return;
                }
                record[item.name] = item.value;
            });
            // end building object

            // reset form fields
            $(`form.${catId}`).trigger("reset");
            
            // send record to the db
            
            // insert new table row with values
            let $newRow = `<tr class="${record.item}">
                <form class="${record.item}">
                <td><input type="checkbox" name="include" class="include" checked></td>
                <td><input type="text" name="item" class="items item" value="${record.item}"></td>
                <td><input type="number" name="quantity" class="items quantity" value="${record.quantity}"></td>
                <td><input type="number" name="grams" class="items grams" value="${record.grams}"></td>
                <td><input type="number" name="ounces" class="items ounces" value="${record.ounces}"></td>
                <td><i class="bi bi-x-circle" id="${catId}-${record.item}-delete"></i></td>
            </form></tr>`;
            
            // Animate new row
            $($newRow).hide().appendTo(`tbody.${catId}`).fadeIn('slow');

            // update dashboard values
            // category item count
            let $dashCount = parseInt($(`.${catId} .dash-count`).html(), 10);
            $(`.${catId} .dash-count`).html($dashCount + record.quantity);
            // category total grams
            let $dashGrams = parseInt($(`.${catId} .dash-grams`).html(), 10);
            let amountG = record.grams * record.quantity;
            $(`.${catId} .dash-grams`).html(round(amountG + $dashGrams, 1));
            // category total ounces
            let $dashOz = parseInt($(`.${catId} .dash-oz`).html(), 10);
            let amountOz = record.ounces * record.quantity;
            $(`.${catId} .dash-oz`).html(round(amountOz + $dashOz,1));

            // Activate the item delete button
            $(`#${catId}-${record.item}-delete`).on('click', (e) => {
                if (confirm(`Are you sure you want to delete ${record.item} from ${catId}?`)) {
                    console.log('need to delete the <tr>, and delete the record from the db.');
                } else {
                    console.log('do nothing');
                }
            });
            $(`#${catId}-${record.item}-delete`).mouseenter(() => {$(`#${catId}-${record.item}-delete`).css('color', 'red')}).mouseleave(() => {$(`#${catId}-${record.item}-delete`).css('color', 'black')})
        });
    }

    $('.cat-delete').on('hover', ()=>{
        // change pointer and highlight icon
    });

    $('.cat-delete').on('click', ()=>{
        // open modal to confirm section delete.
        // if confirmed then delete section from page
        // delete all items with matching section from db
    })

}