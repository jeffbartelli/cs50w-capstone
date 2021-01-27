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
    let dashboardUpdate = () => {
        /* Update Subtotals Table */
        /* Extract all category names */
        let categories = [];
        $('div.category').each(function() {
            categories.push(this.id.toLowerCase());
        });
        let $inclCatArr = [];
        $('input[name="include-category"]').each(function(i,item) {
            $inclCatArr.push($(item).is(':checked'));
        });
        let $totalCt = 0; 
        let $totalG = 0; 
        let $totalOz = 0;
        $(categories).each(function(i, cat) {
            let $count = 0;
            let $gram = 0;
            let $oz = 0;
            if ( $inclCatArr[i] === true ) {
                let $ctArr = [];
                let $inclArr = [];
                $(`tbody.${cat} input[name="include-item"]`).each(function(i, item) {
                    $inclArr.push($(item).is(':checked'));
                });
                $(`tbody.${cat} input[name="quantity"]`).each(function(i, item) {
                    if ($inclArr[i] === true) {
                        $count += parseInt($(item).val());
                    }
                    $ctArr.push(parseInt($(item).val()));              
                });
                $(`tbody.${cat} input[name="grams"]`).each(function(i, item) {
                    if ($inclArr[i] === true) {
                        $gram += parseFloat($(item).val()) * $ctArr[i];
                    }
                });
                $(`tbody.${cat} input[name="ounces"]`).each(function(i, item) {
                    if ($inclArr[i] === true) {
                        $oz += parseFloat($(item).val()) * $ctArr[i];
                    }
                });
            }
            $totalCt += $count;
            $totalG += $gram;
            $totalOz += $oz;
            /* Update the subtotal table category row
            /* Update the row count */
            $(`.${cat} .dash-count`).html($count);
            /* Update the row ounces */
            $(`.${cat} .dash-oz`).html(round($oz,1));
            /* Update the row grams */
            $(`.${cat} .dash-grams`).html(round($gram, 1));
        });
        /* Update the Totals Table */
        let $target = $('#targetWeight').val();
        /* Update total pack weight and total items */
        $('#total-g').text(round($totalG,1));
        $('#total-oz').text(round($totalOz, 1));
        $('#total-item').text($totalCt);
        /* Update the pack weight variance */
        if ($('input[name="targetUnits"]:checked').val() === "grams") {
            $('#var-g').text(round($target - $totalG, 1) || 0);
            $('#var-oz').text(round(($target * 0.035274) - $totalOz, 1) || 0);
        } else {
            $('#var-g').text(round(($target * 28.34) - $totalG, 1) || 0);
            $('#var-oz').text(round($target - $totalOz, 1) || 0);
        }
        /* Change Variance Value color relative to zero */
        if ($('#var-g').val() < 0) {
            $('#var-g').css('color','red');
            $('#var-oz').css('color','red');
        } else {
            $('#var-g').css('color','black');
            $('#var-oz').css('color','black');
        }
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

        // base all 'new item' units on target weight unit
        $('input[name="units"]').each(function() {
            if ($(this).val() === unit) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        });

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

    // Functionality within categories
    $('.category').each(function(i, cat) {
        $(this).find('.include-item').each(function() {
            $(this).on('change', function() {
                fetch('/include', {
                    method: "PUT",
                    body: JSON.stringify({
                        include: $(this).is(':checked'),
                        category: $(this).closest('tbody').attr('class'),
                        item: $(this).closest('tr').attr('class'),
                    })
                });
                dashboardUpdate();
            });
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
                        dashboardUpdate();
                    }
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
            let $oldItem = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text]').val().toLowerCase();
            let $oldValues = {};
            $(this).closest('tr').find('.items').each(function(i, item) {
                $oldValues[$(item).attr("name")] = $(item).val().toLowerCase();
            });
            $(this).on('click', function() {
                let $inputs = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text],:input[type=number]');
                if (this.innerText === "Update") {
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',false).css({'border-color': "goldenrod", "border-weight": "1px", "border-style": "solid"});
                    });
                    $(this).removeClass('btn-outline-secondary').addClass('btn-warning').text("Submit");
                    $(this).next().removeClass('btn-outline-secondary').addClass('btn-danger').text("Cancel");
                } else if (this.innerText === "Submit") {
                    $($inputs).each(function(i, item) {
                        let field = $(item).attr("name");
                        let value = $(item).val().toLowerCase();
                        if (field === "grams") {
                            if (parseFloat($oldValues.grams) !== parseFloat(value)) {
                                $($($(`.${$(this).closest('tr').attr('class')}`)[0]).find('[name="ounces"]')[0]).val(round(parseFloat(value) * 0.035274,1));
                            }
                        }
                        if (field === "ounces") {
                            if (parseFloat($oldValues.ounces) !== parseFloat(value)) {
                                $($($(`.${$(this).closest('tr').attr('class')}`)[0]).find('[name="grams"]')[0]).val(round(parseFloat(value) * 28.35,1));
                            }
                        }
                    });
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
                    fetch('/update_item', {
                        method: 'POST',
                        body: JSON.stringify($values)
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                    });          

                    dashboardUpdate();
                    // Revert to original buttons
                    $(this).removeClass('btn-warning').addClass('btn-outline-secondary').text("Update");
                    $(this).next().removeClass('btn-danger').addClass('btn-outline-secondary').text("Delete");
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',true).css('border', 'none');
                    });
                }
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
        $(`.include-${category}`).on('change', function() {
            // /* This fetch is unnecessary at this time. If I can figure out how to create the Category model that I want, then it will be refactored and reactivated. */
            // fetch('/include', {
            //     method: "PUT",
            //     body: JSON.stringify({
            //         include: $(this).is(':checked'),
            //         category: category,
            //         item: false,
            //     })
            // });
            if ( $(this).is(':checked') ) {
                $(this).closest('.category').find('input[name="include-item"]').each(function(i, item) {
                    console.log(item);
                    $(item).attr('disabled', false);
                });
            } else {
                $(this).closest('.category').find('input[name="include-item"]').each(function(i, item) {
                    $(item).attr('disabled', true);
                });
            }
            dashboardUpdate();
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
            let data = new FormData($(`form.${category}-item-generator`)[0]);
            let $existing = []
            $(`div#${category} input.item`).each(function(i, item) {
                $existing.push($(item).val().toLowerCase());
            });
            if ($.inArray(data.get('item').toLowerCase(), $existing) != -1) {
                alert('This item name already exists within this category. Please select a different name.');
                return false;
            }
            let record = {
                include: true,
                category: category,
                item: data.get('item').toLowerCase(),
                quantity: parseInt(data.get('quantity')),
            }
            if (data.get('units') === "ounces") {
                record.ounces = round(parseFloat(data.get('weight')),1);
                record.grams = round(data.get('weight') * 28.35, 1);
            } else {
                record.ounces = round(data.get('weight') * 0.035274, 1);
                record.grams = round(parseFloat(data.get('weight')),1);
            }
            fetch('/new_item', {
                method: 'POST',
                body: JSON.stringify(record)
            });

            // reset form fields
            $(`form.${category}-item-generator`).trigger("reset");

            // deactivate the create button
            $(`#${category}-item-submit`).prop("disabled", true);
            
            let newDisplay = record.item.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
            // insert new table row with values
            let $newRow = `<tr class="${record.item}">
                <td>
                    <input type="checkbox" name="include-item" class="include-item include-${category}-${record.item}" checked>
                </td>
                <td>
                    <input type="text" name="item" class="items item w-100" value="${newDisplay}" disabled>
                </td>
                <td>
                    <input type="number" name="quantity" class="items quantity w-75" value="${record.quantity}" disabled>
                </td>
                <td>
                    <input type="number" name="grams" class="items grams w-75" value="${record.grams}" disabled>
                </td>
                <td>
                    <input type="number" name="ounces" class="items ounces w-75" value="${record.ounces}" disabled>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-secondary btn-sm update-item" type="button">Update</button>
                        <button class="btn btn-outline-secondary btn-sm delete-item" type="button" id="${category}-${record.item}-delete">Delete</button>
                    </div>
                </td></tr>`;
            
            // Animate new row
            $($newRow).hide().appendTo(`tbody.${category}`).fadeIn('slow');

            // update dashboard values
            dashboardUpdate();

            // Activate the update button
            $(`div#${category} button.update-item:last`).on('click', function() {
                let $oldItem = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text]').val().toLowerCase();
                let $oldValues = {};
                $(this).closest('tr').find('.items').each(function(i, item) {
                    $oldValues[$(item).attr("name")] = $(item).val().toLowerCase();
                });
                let $inputs = $($(`.${$(this).closest('tr').attr('class')}`)[0]).find(':input[type=text],:input[type=number]');
                if (this.innerText === "Update") {
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',false).css({'border-color': "goldenrod", "border-weight": "1px", "border-style": "solid"});
                    });
                    $(this).removeClass('btn-outline-secondary').addClass('btn-warning').text("Submit");
                    $(this).next().removeClass('btn-outline-secondary').addClass('btn-danger').text("Cancel");
                } else if (this.innerText === "Submit") {
                    $($inputs).each(function(i, item) {
                        let field = $(item).attr("name");
                        let value = $(item).val().toLowerCase();
                        if (field === "grams") {
                            if (parseFloat($oldValues.grams) !== parseFloat(value)) {
                                $($($(`.${$(this).closest('tr').attr('class')}`)[0]).find('[name="ounces"]')[0]).val(round(parseFloat(value) * 0.035274,1));
                            }
                        }
                        if (field === "ounces") {
                            if (parseFloat($oldValues.ounces) !== parseFloat(value)) {
                                $($($(`.${$(this).closest('tr').attr('class')}`)[0]).find('[name="grams"]')[0]).val(round(parseFloat(value) * 28.35,1));
                            }
                        }
                    });
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
                    fetch('/update_item', {
                        method: 'POST',
                        body: JSON.stringify($values)
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                    });          

                    dashboardUpdate();
                    // Revert to original buttons
                    $(this).removeClass('btn-warning').addClass('btn-outline-secondary').text("Update");
                    $(this).next().removeClass('btn-danger').addClass('btn-outline-secondary').text("Delete");
                    $($inputs).each(function(i, item) {
                        $(item).prop('disabled',true).css('border', 'none');
                    });
                }
            });
            
            // Activate the item include button
            $(`.include-${category}-${record.item}`).on('change', function() {
                fetch('/include', {
                    method: "PUT",
                    body: JSON.stringify({
                        include: $(this).is(':checked'),
                        category: category,
                        item: record.item,
                    })
                });
                dashboardUpdate();
            });

            // Activate the item delete button
            $(`#${category}-${record.item}-delete`).on('click', function() {
                if (this.innerText === "Delete") {
                    if (confirm(`Are you sure you want to delete ${record.item} from ${category}?`)) {
                        fetch('/delete_item', {
                            method: 'POST',
                            body: JSON.stringify({
                                category: category,
                                item: record.item
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result);
                        });
                        $(this).closest('tr').slideUp('slow', function() {
                            $(this).remove();
                        });
                        dashboardUpdate();
                    }
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

        let $node = `
            <div class="category ${$name}-category card mt-1" id="${$name}">
                <div class="card-header d-flex justify-content-between" style="background-color: gold;">
                    <span class="h4">
                        <input type="checkbox" class="include-${$name}" name="include-category" checked>  ${$display}
                    </span>
                    <i class="bi bi-x-square ml-1 ${$name}-cat-delete h4"></i>
                </div>
                <div class="card-body">
                    <table class="table table-hover table-sm">
                        <thead>
                            <tr>
                                <th>Include</th>
                                <th>Item Description</th>
                                <th>QTY</th><th>Grams</th>
                                <th>Ounces</th>
                                <th>Manage</th>
                            </tr>
                        </thead>
                        <tbody class="${$name}">
                        </tbody>
                    </table>
                    <form class="${$name}-item-generator d-flex justify-content-center p-1 border rounded">
                        <div class="mr-1">
                            <span>Create A New Item: </span>
                            <input type="text" name="item" class="${$name}-desc" autofocus>
                        </div>
                        <div class="mr-1">
                            <span>Quantity: </span>
                            <input type="text" name="quantity" size="3" class="${$name}-qty">
                        </div>
                        <div class="mr-1">
                            <span>Weight: </span>
                            <input type="text" min="0" size="5" name="weight" class="${$name}-weight">
                        </div>
                        <div class="mr-1 d-flex flex-sm-wrap">
                            <span>Units: </span>
                            <span class="d-sm-flex justify-content-sm-start">
                                <input type="radio" name="units" id="${$name}-grams" value="grams" ${$('input[name="targetUnits"]:checked').val() === "grams" ? "checked" : ""}checked>
                                <label for="${$name}-grams"> g</label>
                                <input type="radio" name="units" id="${$name}-ounces" value="ounces" ${$('input[name="targetUnits"]:checked').val() === "ounces" ? "checked" : ""}>
                                <label for="${$name}-ounces"> oz</label>
                            </span
                        </div>
                        <div class="d-flex align-items-center">
                            <input type="submit" value="Create" class="ml-1 btn btn-outline-secondary btn-sm" id="${$name}-item-submit" disabled>
                        </div>
                    </form>
                </div>
            </div>`;

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