window.onload = function() {

    // Function for rounding numbers
    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    // Update the visited value in the 'How it works' section for an authenticated user
    $('#confirmCollapse').on('change', ()=>{
        let visitor = $('input#confirmCollapse').is(':checked') ? true : false;
        fetch('/return_visitor', {
            method: 'PUT',
            body: JSON.stringify({
                visited: visitor
            })
        });
    });

    // Expand the how it works section
    $('#howItWorksExpand').on('click', (e)=>{
        let $unit = $('#howItWorksExpand');
        if ($unit.hasClass('bi-arrow-down-square')) {
            $unit.removeClass('bi-arrow-down-square').addClass('bi-arrow-up-square');
        } else {
            $unit.removeClass('bi-arrow-up-square').addClass('bi-arrow-down-square'); 
        }
    });

    // Updates the totals table (dashboard)
    let dashboardUpdate = (catName, object) => {
        if (catName !== undefined) {
            let $dashCount = parseInt($(`.${catName} .dash-count`).html(), 10);
            $(`.${catName} .dash-count`).html($dashCount + object.quantity);
            // category total grams
            let $dashGrams = parseInt($(`.${catName} .dash-grams`).html(), 10);
            let amountG = object.grams * object.quantity;
            $(`.${catName} .dash-grams`).html(round(amountG + $dashGrams, 1));
            // category total ounces
            let $dashOz = parseInt($(`.${catName} .dash-oz`).html(), 10);
            let amountOz = object.ounces * object.quantity;
            $(`.${catName} .dash-oz`).html(round(amountOz + $dashOz,1));
        }
        // Update Totals Table
        let target = parseFloat(document.querySelector('#targetWeight').value);
        let weightsG = 0;
        document.querySelectorAll('.dash-grams').forEach((item)=>{
            weightsG += parseFloat(item.innerText);
        });
        let weightsOz = 0;
        document.querySelectorAll('.dash-oz').forEach((item)=>{
            weightsOz += parseFloat(item.innerText);
        });
        let items = 0;
        document.querySelectorAll('.dash-count').forEach((item)=>{
            items += parseInt(item.innerText);
        });

        if ($('input[name="targetUnits"]:checked').val() === "grams") {
            $('#var-g').text(round(target - weightsG, 1) || 0);
            $('#var-oz').text(round((target * 0.035274) - weightsOz, 1) || 0);
        } else {
            $('#var-g').text(round((target * 28.34) - weightsG, 1) || 0);
            $('#var-oz').text(round(target - weightsOz, 1) || 0);
        }
        if ($('#var-g').val() < 0) {
            $('#var-g').css('color','red');
            $('#var-oz').css('color','red');
        } else {
            $('#var-g').css('color','black');
            $('#var-oz').css('color','black');
        }
        $('#total-g').text(round(weightsG,1));
        $('#total-oz').text(round(weightsOz, 1));
        $('#total-item').text(items);
    }
    dashboardUpdate();

    // Update Target Weight
    $('#update-weight').on('click', (e) => {
        e.preventDefault();

        // confirm contents are numbers, remove 
        if (!$.isNumeric($('#targetWeight').val()) || $('#targetWeight').val() < 0) {
            alert('You must enter a positive number.');
            $('#targetWeight').val($('#targetWeight').attr("data-value"));
            return false;
        }
        
        // retrieve unit value
        let unit = $('input[name="targetUnits"]:checked').val() === "grams" ? "grams" : "ounces";

        // Send data to python function
        fetch('/total_weight', {
            method: 'PUT',
            body: JSON.stringify({
                weight: $('#targetWeight').val(),
                units: unit
            })
        });

        dashboardUpdate();
    });

    // Activates the 'Create' button for new category dialogue
    $('#create-category').on('keyup', (e)=>{
        if ($('#create-category').val().length > 0) {
            $('#category-submit').prop('disabled', false);
        } else {
            $('#category-submit').prop('disabled', true);
        }
    });    

    // Include exclude functionality for items in categories
    $('.category').each(function(i, cat) {
        $(this).find('.include-item').each(function() {
            $(this).on('change', () => {
                alert('I want to be left out!');
            });
            // TODO include/exclude item
        });
        // Activate the item delete button
        $(this).find('.delete-item').each(function(i, item) {
            $(this).on('click', function() {
                if (this.innerText === "Delete") {
                    if (confirm(`Are you sure you want to delete ${$(item).closest('tr').attr('class')} from ${cat.id}?`)) {
                        fetch('/delete_item', {
                            method: 'POST',
                            body: JSON.stringify({
                                category: cat.id,
                                item: $(item).closest('tr').attr('class')
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result);
                        });
                        $(this).closest('tr').slideUp('slow', function() {
                            $(this).remove();
                        });
                    }
// TODO - tables need to update
                } else if (this.innerText === "Cancel") {
                    let $inputs = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text],:input[type=number]');
                    // Revert to original buttons
                    $(this).removeClass('btn-danger').addClass('btn-outline-secondary').text("Delete");
                    $(this).prev().removeClass('btn-warning').addClass('btn-outline-secondary').text("Update");
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',true).css('border', 'none');
                    });
                }
                
            });
        });
        // Activate the item update button
        $(this).find('.update-item').each(function() {
            $(this).on('click', function() {
                let $oldItem = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text]').val().toLowerCase();
                let $inputs = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text],:input[type=number]');
                if (this.innerText === "Update") {
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',false).css({'border-color': "goldenrod", "border-weight": "1px", "border-style": "solid"});
                    });
                    $(this).removeClass('btn-outline-secondary').addClass('btn-warning').text("Submit");
                    $(this).next().removeClass('btn-outline-secondary').addClass('btn-danger').text("Cancel");
                } else if (this.innerText === "Submit") {
// TODO - create an object of old input values, then use this to compare against the new values. If a weight has changed then the other one needs to be adjusted.
                    // Fetch to send updated values to db
                    let $values = {
                        oldItem: $oldItem,
                        include: true,
                        category: $(this).closest('div.category').attr('id'),
                    };
                    $($inputs).each(function(i, item) {
                        if ($(item).attr('type') === "text") {
                            $values[$(item).attr("name")] = $(item).val().toLowerCase();
                        } else {
                            $values[$(item).attr("name")] = parseFloat($(item).val());
                        }
                    });
                    console.log($values);
                    fetch('/update_item', {
                        method: 'POST',
                        body: JSON.stringify($values)
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                    });          

                    dashboardUpdate($oldItem, $values);
                    // Revert to original buttons
                    $(this).removeClass('btn-warning').addClass('btn-outline-secondary').text("Update");
                    $(this).next().removeClass('btn-danger').addClass('btn-outline-secondary').text("Delete");
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',true).css('border', 'none');
                    });
                }
                
                

            });
            // TODO update item
        });

        $(`#${cat.id}-item-submit`).on('click', (e) => {
            e.preventDefault();
            let data = new FormData($(`form.${cat.id}-item-generator`)[0]);
            let stuff = {
                include: true,
                category: cat.id,
                item: data.get('item'),
                quantity: parseInt(data.get('quantity')),
            }
            if (data.get('units') === "ounces") {
                stuff.ounces = round(parseFloat(data.get('weight')),1);
                stuff.grams = round(data.get('weight') * 28.35, 1);
            } else {
                stuff.ounces = round(data.get('weight') * 0.035274, 1);
                stuff.grams = round(parseFloat(data.get('weight')),1);
            }
            fetch('/new_item', {
                method: 'POST',
                body: JSON.stringify(stuff)
            });
        });

        // Apply event listeners to categories
        let $name = this.id.toLowerCase();
        let $display = this.id.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        catUtilities($name, $display);
    });

    function catUtilities(category, display) {
        // Category Delete Listener
        $(`.${category}-cat-delete`).mouseenter(()=>{$(`.${category}-cat-delete`).css('color','firebrick')}).mouseleave(()=>{$(`.${category}-cat-delete`).css('color','black')});
        $(`.${category}-cat-delete`).on('click', function(e) {
            if (confirm(`Are you sure you want to delete ${display} from your pack? All items will be lost.`)) {
                fetch('/delete_category', {
                    method: 'POST',
                    body: JSON.stringify({
                        category: category,
                    })
                });
                $(this).closest('div.category').slideUp('slow', function() {
                    $(this).remove();
                });
                $(`tr.${category}`).slideUp('slow', function() {
                    $(this).remove();
                });
                dashboardUpdate();
            }
        });

        // Category Include/Exclude Listener
        $(`.include-${category}`).on('change', () => {
            console.log(`${category} should be included or excluded.`);
            // Needs to be built out.
        });

        // New item submit button only when all fields populated
        $(`.${category}-item-generator :input`).on('change', () => {
            if ($(`.${category}-desc`).val() !== '' && $(`.${category}-qty`).val() !== '' && $(`.${category}-weight`).val() !== '') {
                $(`#${category}-item-submit`).prop("disabled", false);
            }
        });

        // Add new item on submit; update dashboard; send values to db; add more event listeners
        $(`#${category}-item-submit`).on('click', (e) => {
            e.preventDefault();
            
            // Build object to send with API
            let x = $(`form.${category}-item-generator`).serializeArray();
            let record = {
                include: true,
                category: category,
            };  

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
            $(`form.${category}-item-generator`).trigger("reset");

            // deactivate the create button
            $(`#${category}-item-submit`).prop("disabled", true);
            
            // send record to the db
            fetch('/new_item', {
                method: 'POST',
                body: JSON.stringify(record)
            });
            
            // insert new table row with values
            let $newRow = `<tr class="${record.item}">
                <td><input type="checkbox" name="include" class="include-item include-${category}-${record.item}" checked></td>
                <td><input type="text" name="item" class="items item" value="${record.item}" disabled></td>
                <td><input type="number" name="quantity" class="items quantity" value="${record.quantity}" disabled></td>
                <td><input type="number" name="grams" class="items grams" value="${record.grams}" disabled></td>
                <td><input type="number" name="ounces" class="items ounces" value="${record.ounces}" disabled></td>
                <td><div class="btn-group" role="group">
                <button class="btn btn-outline-secondary btn-sm update-item" type="button">Update</button>
                <button class="btn btn-outline-secondary btn-sm delete-item" type="button" id="${category}-${record.item}-delete">Delete</button></div></td></tr>`;
            
            // Animate new row
            $($newRow).hide().appendTo(`tbody.${category}`).fadeIn('slow');

            // update dashboard values
            dashboardUpdate(category, record);

            // Activate the item include button
            $(`.include-${category}-${record.item}`).on('change', () => {
                alert('I want to be left out!');
            })
            
            // Activate the item delete button
            $(`#${category}-${record.item}-delete`).on('click', function() {
                if (confirm(`Are you sure you want to delete ${record.item} from ${category}?`)) {
                    fetch('/delete_item', {
                        method: 'POST',
                        body: JSON.stringify({
                            category: category,
                            item: record.item
                        })
                    });
                    $(this).closest('tr').slideUp('slow', function() {
                        $(this).remove();
                    });
                }
            });
        });
    }
    
    // Creates the new category on submit.
    $('#category-submit').on('click', function() {
        let $name = $('#create-category').val().toLowerCase();
        if ($('.category').hasClass(`${$name}-category`)) {
            alert('This category name already exists. Please select a different name.');
            $('#create-category').val('');
        } else {
            categoryGen($name);
            $('body,html').animate(
                {
                    scrollTop: $(`#${$name}`).offset().top
                },
                800
            );
        }
    });

    // Generates the new category and all related functionality
    let categoryGen = (name) => {
        let $display = name.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        let $name = name.toLowerCase();

        let $node = `<div class="category ${$name}-category card mt-1" id="${$name}"><div class="card-header d-flex justify-content-between" style="background-color: gold;"><span class="h4"><input type="checkbox" class="include-${$name}" checked>  ${$display}</span><i class="bi bi-x-square ml-1 ${$name}-cat-delete h4"></i></div><div class="card-body"><table class="table table-hover table-sm"><thead><tr><th>Include</th><th>Item Description</th><th>QTY</th><th>Grams</th><th>Ounces</th><th>Manage</th></tr></thead><tbody class="${$name} tbod"></tbody></table><form class="${$name}-item-generator d-flex justify-content-center p-1 border rounded"><div class="mr-1"><span>Create A New Item: </span><input type="text" name="item" class="${$name}-desc" autofocus></div><div class="mr-1"><span>Quantity: </span><input type="text" name="quantity" size="3" class="${$name}-qty"></div><div class="mr-1"><span>Weight: </span><input type="text" min="0" size="5" name="weight" class="${$name}-weight"><span>Units: </span><input type="radio" name="units" id="${$name}-grams" value="grams" checked><label for="${$name}-grams"> g</label><input type="radio" name="units" id="${$name}-ounces" value="ounces"><label for="${$name}-ounces"> oz</label></div><input type="submit" value="Create" class="ml-1 btn btn-outline-secondary btn-sm" id="${$name}-item-submit" disabled></form></div></div>`;

        // Animate new category
        $($node).hide().insertBefore('#category-generator').slideDown('slow');
        $('#create-category').val('');
        $('#category-submit').prop('disabled', true);

        // Add category row to the dashboard
        let $row = (`<tr class="${$name}"><th scope="row">${$display}</th><td class="dash-grams" style="text-align: right;">0</td><td class="dash-oz" style="text-align: right;">0</td><td class="dash-count" style="text-align: center;">0</td></tr>`);
        $($row).appendTo('#category-dash');
        
        // Add delete & exclude functionality to categories, activate new item create button when all inputs populated
        catUtilities($name, $display);        
    }
}