const API_BASE_URL = 'http://127.0.0.1:3003';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Main Navigation
    const userBtn = document.getElementById('userBtn');
    const adminBtn = document.getElementById('adminBtn');
    const userSection = document.getElementById('userSection');
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminDashboard = document.getElementById('adminDashboard');
    
    // DOM Elements - Customer Forms
    const customerInfoForm = document.getElementById('customerInfoForm');
    const productFeedbackForm = document.getElementById('productFeedbackForm');
    const serviceFeedbackForm = document.getElementById('serviceFeedbackForm');
    const thankYouMessage = document.getElementById('thankYouMessage');
    
    // DOM Elements - Navigation Buttons
    const continueBtn = document.getElementById('continueBtn');
    const backFromProductBtn = document.getElementById('backFromProductBtn');
    const backFromServiceBtn = document.getElementById('backFromServiceBtn');
    const submitProductBtn = document.getElementById('submitProductBtn');
    const submitServiceBtn = document.getElementById('submitServiceBtn');
    const newFeedbackBtn = document.getElementById('newFeedbackBtn');
    const returnHomeBtn = document.getElementById('returnHomeBtn');
    const backFromAdminBtn = document.getElementById('backFromAdminBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // Customer ID for the current session
    let currentCustomerId = null;

    // Initialize select dropdowns and star ratings
    initializeRatings();

    // Load products and services for dropdowns
    fetchProducts();
    fetchServices();
    
    // =============== Event Listeners ===============
    
    // Main Navigation
    userBtn.addEventListener('click', function() {
        hideAllSections();
        userSection.classList.remove('d-none');
    });
    
    adminBtn.addEventListener('click', function() {
        hideAllSections();
        adminLoginSection.classList.remove('d-none');
    });
    
    // Customer Form Navigation
    continueBtn.addEventListener('click', function() {
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerEmail').value;
        const phone = document.getElementById('customerPhone').value;
        
        if (!name || !email) {
            alert('Please enter your name and email.');
            return;
        }
        
        // Register or get customer ID
        registerCustomer(name, email, phone);
    });
    
    backFromProductBtn.addEventListener('click', function() {
        productFeedbackForm.classList.add('d-none');
        customerInfoForm.classList.remove('d-none');
    });
    
    backFromServiceBtn.addEventListener('click', function() {
        serviceFeedbackForm.classList.add('d-none');
        customerInfoForm.classList.remove('d-none');
    });
    
    submitProductBtn.addEventListener('click', submitProductFeedback);
    submitServiceBtn.addEventListener('click', submitServiceFeedback);
    
    newFeedbackBtn.addEventListener('click', function() {
        resetForms();
        thankYouMessage.classList.add('d-none');
        customerInfoForm.classList.remove('d-none');
    });
    
    returnHomeBtn.addEventListener('click', function() {
        resetForms();
        hideAllSections();
        document.querySelector('.container').classList.remove('d-none');
    });
    
    // Admin Section
    backFromAdminBtn.addEventListener('click', function() {
        adminLoginSection.classList.add('d-none');
        document.querySelector('.container').classList.remove('d-none');
    });
    
    adminLoginBtn.addEventListener('click', function() {
        const password = document.getElementById('adminPassword').value;
        
        fetch(`${API_BASE_URL}/api/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                adminLoginSection.classList.add('d-none');
                adminDashboard.classList.remove('d-none');
                loadAdminData();
            } else {
                alert('Invalid password. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    adminLogoutBtn.addEventListener('click', function() {
        adminDashboard.classList.add('d-none');
        document.querySelector('.container').classList.remove('d-none');
        document.getElementById('adminPassword').value = '';
    });
    
    // Tab navigation for admin dashboard
    document.querySelectorAll('#adminTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            document.querySelectorAll('#adminTabs .nav-link').forEach(t => {
                t.classList.remove('active');
            });
            
            // Hide all tab content
            document.querySelectorAll('.tab-pane').forEach(content => {
                content.classList.remove('show', 'active');
            });
            
            // Activate clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const target = document.querySelector(this.getAttribute('href'));
            target.classList.add('show', 'active');
            
            // Load data if needed
            if (this.id === 'productFeedbackTab') {
                loadProductFeedbacks();
            } else if (this.id === 'serviceFeedbackTab') {
                loadServiceFeedbacks();
            } else if (this.id === 'productAnalyticsTab') {
                loadProductAnalytics();
            } else if (this.id === 'serviceAnalyticsTab') {
                loadServiceAnalytics();
            }
        });
    });
    
    // =============== Functions ===============
    
    function hideAllSections() {
        document.querySelector('.container').classList.add('d-none');
        userSection.classList.add('d-none');
        adminLoginSection.classList.add('d-none');
        adminDashboard.classList.add('d-none');
    }
    
    function resetForms() {
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('productComments').value = '';
        document.getElementById('serviceComments').value = '';
        
        // Reset ratings
        document.querySelectorAll('.rating .star').forEach(star => {
            star.classList.remove('selected');
        });
        
        document.querySelectorAll('input[type="hidden"]').forEach(input => {
            if (input.id.includes('RatInput')) {
                input.value = '0';
            }
        });
        
        // Reset radio buttons for feedback type if they exist
        const productFeedbackRadio = document.getElementById('productFeedback');
        if (productFeedbackRadio) {
            productFeedbackRadio.checked = true;
        }
        
        // Reset select dropdown for "use again" if it exists
        const useAgainSelect = document.getElementById('useAgain');
        if (useAgainSelect) {
            useAgainSelect.value = 'Yes';
        }
        
        // Hide feedback forms
        productFeedbackForm.classList.add('d-none');
        serviceFeedbackForm.classList.add('d-none');
        thankYouMessage.classList.add('d-none');
    }
    /*
    function initializeRatings() {
        const ratingContainers = document.querySelectorAll('.rating');
        
        ratingContainers.forEach(container => {
            const stars = container.querySelectorAll('.star');
            const inputId = container.id + 'Input';
            const input = document.getElementById(inputId);
            
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    input.value = value;
                    
                    // Reset all stars
                    stars.forEach(s => s.classList.remove('selected'));
                    
                    // Select stars up to the clicked one
                    for (let i = 0; i < value; i++) {
                        stars[i].classList.add('selected');
                    }
                });
            });
        });
    }
    */

    function initializeRatings() {
        const ratingContainers = document.querySelectorAll('.rating');
        
        ratingContainers.forEach(container => {
            const stars = container.querySelectorAll('.star');
            const inputId = container.id + 'Input';
            const hiddenInput = document.getElementById(inputId);
            
            if (!hiddenInput) {
                console.error(`Hidden input not found for rating container: ${container.id}`);
                return;
            }
            
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = parseInt(this.getAttribute('data-value'));
                    
                    // Reset all stars (remove selected class)
                    stars.forEach(s => s.classList.remove('selected'));
                    
                    // Highlight stars up to the clicked one (inclusive)
                    for (let i = 0; i < stars.length; i++) {
                        if (i < value) {
                            stars[i].classList.add('selected');
                        } else {
                            stars[i].classList.remove('selected');
                        }
                    }
                    
                    // Update hidden input value
                    hiddenInput.value = value;
                    console.log(`Updated ${inputId} to value: ${value}`);
                });
            });
        });
    }
    
    function fetchProducts() {
        fetch(`${API_BASE_URL}/api/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                const select = document.getElementById('productSelect');
                select.innerHTML = '';
                
                // Check if products array exists and has items
                if (products && products.length > 0) {
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.prod_id;
                        option.textContent = product.prod_name;
                        select.appendChild(option);
                    });
                } else {
                    // Add a default option if no products
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "No products available";
                    select.appendChild(option);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                
                // Add fallback UI in case of error
                const select = document.getElementById('productSelect');
                select.innerHTML = '';
                
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "Error loading products";
                select.appendChild(option);
            });
    }
    
    function fetchServices() {
        fetch(`${API_BASE_URL}/api/services`)
            .then(response => response.json())
            .then(services => {
                const select = document.getElementById('serviceSelect');
                select.innerHTML = '';
                
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.s_id;
                    option.textContent = service.s_type;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }
    
    function registerCustomer(name, email, phone) {
        fetch(`${API_BASE_URL}/api/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store customer ID consistently
            currentCustomerId = data.customerId;
            
            // Show appropriate feedback form
            customerInfoForm.classList.add('d-none');
            
            if (document.getElementById('productFeedback').checked) {
                productFeedbackForm.classList.remove('d-none');
            } else {
                serviceFeedbackForm.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error registering your information. Please try again.');
        });
    }
    
    function submitProductFeedback() {
        const prod_id = document.getElementById('productSelect').value;
        const perform_rat = document.getElementById('performRatingInput').value;
        const price_rat = document.getElementById('priceRatingInput').value;
        const p_qual_rat = document.getElementById('qualityRatingInput').value;
        const design_rat = document.getElementById('designRatingInput').value;
        const comfort_rat = document.getElementById('comfortRatingInput').value;
        const overall_rating = document.getElementById('overallProductRatingInput').value;
        const use_again = document.getElementById('useAgain').value;
        const comments = document.getElementById('productComments').value;
        
        // Validate ratings
        if (perform_rat === '0' || price_rat === '0' || p_qual_rat === '0' || 
            design_rat === '0' || comfort_rat === '0' || overall_rating === '0') {
            alert('Please provide ratings for all categories.');
            return;
        }
        
        fetch(`${API_BASE_URL}/api/product-feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cu_id: currentCustomerId, 
                prod_id,
                perform_rat,
                price_rat,
                p_qual_rat,
                design_rat,
                comfort_rat,
                use_again,
                overall_rating,
                comments
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                productFeedbackForm.classList.add('d-none');
                thankYouMessage.classList.remove('d-none');
            } else {
                alert('Error submitting feedback. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    function submitServiceFeedback() {
        const s_id = document.getElementById('serviceSelect').value;
        const s_qual_rat = document.getElementById('serviceQualityRating').value;
        const timeliness = document.getElementById('timelinessRatingInput').value;
        const communication = document.getElementById('communicationRating').value;
        const s_delivery = document.getElementById('serviceDeliveryRating').value;
        const s_provider_knowledge = document.getElementById('providerKnowledgeRating').value;
        const convenience = document.getElementById('convenienceRating').value;
        const overall_rating = document.getElementById('overallServiceRatingInput').value;
        const comments = document.getElementById('serviceComments').value;
        
        // Validate ratings
        if (s_qual_rat === '0' || timeliness === '0' || communication === '0' || 
            s_delivery === '0' || s_provider_knowledge === '0' || convenience === '0' || 
            overall_rating === '0') {
            alert('Please provide ratings for all categories.');
            return;
        }
        
        fetch(`${API_BASE_URL}/api/service-feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cu_id: currentCustomerId,
                s_id,
                s_qual_rat,
                timeliness,
                communication,
                s_delivery,
                s_provider_knowledge,
                convenience,
                overall_rating,
                comments
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                serviceFeedbackForm.classList.add('d-none');
                thankYouMessage.classList.remove('d-none');
            } else {
                alert('Error submitting feedback. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    // Admin Dashboard Functions
    function loadAdminData() {
        loadProductFeedbacks();
        // Other data will be loaded when their tabs are clicked
    }
    
    function loadProductFeedbacks() {
        fetch(`${API_BASE_URL}/api/admin/product-feedbacks`, {
            credentials: 'include' // Add this line
        })
            .then(response => response.json())
            .then(feedbacks => {
                const tableBody = document.getElementById('productFeedbackTable');
                tableBody.innerHTML = '';

                if (!feedbacks || !Array.isArray(feedbacks)) {
                    console.error('Invalid feedback data received:', feedbacks);
                    return;
                }
                
                feedbacks.forEach(feedback => {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const date = new Date(feedback.created_date);
                    const formattedDate = date.toLocaleDateString();
                    
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${feedback.prod_name}</td>
                        <td>${feedback.customer_name || 'Anonymous'}</td>
                        <td>${feedback.overall_rating}/5</td>
                        <td>${feedback.use_again}</td>
                        <td class="feedback-comment">${feedback.comments || ''}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                // Display a user-friendly error message in the table
                const tableBody = document.getElementById('productFeedbackTable');
                tableBody.innerHTML = '<tr><td colspan="6">Failed to load feedback data. Please check your login status.</td></tr>';
            });
    }
    
    function loadServiceFeedbacks() {
        fetch(`${API_BASE_URL}/api/admin/service-feedbacks`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(feedbacks => {
                const tableBody = document.getElementById('serviceFeedbackTable');
                tableBody.innerHTML = '';

                if (!feedbacks || !Array.isArray(feedbacks)) {
                    console.error('Invalid feedback data received:', feedbacks);
                    return;
                }
                
                feedbacks.forEach(feedback => {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const date = new Date(feedback.created_date);
                    const formattedDate = date.toLocaleDateString();
                    
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${feedback.s_type}</td>
                        <td>${feedback.customer_name || 'Anonymous'}</td>
                        <td>${feedback.overall_rating}/5</td>
                        <td class="feedback-comment">${feedback.comments || ''}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                const tableBody = document.getElementById('serviceFeedbackTable');
                tableBody.innerHTML = '<tr><td colspan="5">Failed to load feedback data. Please check your login status.</td></tr>';
            });
    }
    
    function loadProductAnalytics() {
        fetch(`${API_BASE_URL}/api/admin/product-analytics`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(analytics => {
                const tableBody = document.getElementById('productAnalyticsTable');
                tableBody.innerHTML = '';

                if (!analytics || !Array.isArray(analytics)) {
                    console.error('Invalid analytics data received:', analytics);
                    return;
                }
                
                // Prepare chart data
                const productNames = [];
                const avgRatings = [];
                const positiveCount = [];
                const negativeCount = [];
                
                analytics.forEach(item => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${item.prod_name}</td>
                        <td>${item.p_count}</td>
                        <td>${item.n_count}</td>
                        <td>${item.avg_rat}</td>
                    `;
                    
                    tableBody.appendChild(row);
                    
                    // Add to chart data
                    productNames.push(item.prod_name);
                    avgRatings.push(parseFloat(item.avg_rat));
                    positiveCount.push(parseInt(item.p_count));
                    negativeCount.push(parseInt(item.n_count));
                });
                
                // Create chart
                renderProductChart(productNames, avgRatings, positiveCount, negativeCount);
            })
            .catch(error => {
                console.error('Error:', error);
                const tableBody = document.getElementById('productAnalyticsTable');
                tableBody.innerHTML = '<tr><td colspan="4">Failed to load analytics data. Please check your login status.</td></tr>';
            });
    }
    
    function loadServiceAnalytics() {
        fetch(`${API_BASE_URL}/api/admin/service-analytics`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(analytics => {
                const tableBody = document.getElementById('serviceAnalyticsTable');
                tableBody.innerHTML = '';

                if (!analytics || !Array.isArray(analytics)) {
                    console.error('Invalid analytics data received:', analytics);
                    return;
                }
                
                // Prepare chart data
                const serviceNames = [];
                const avgRatings = [];
                const positiveCount = [];
                const negativeCount = [];
                
                analytics.forEach(item => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${item.s_type}</td>
                        <td>${item.p_count}</td>
                        <td>${item.n_count}</td>
                        <td>${item.avg_rat}</td>
                    `;
                    
                    tableBody.appendChild(row);
                    
                    // Add to chart data
                    serviceNames.push(item.s_type);
                    avgRatings.push(parseFloat(item.avg_rat));
                    positiveCount.push(parseInt(item.p_count));
                    negativeCount.push(parseInt(item.n_count));
                });
                
                // Create chart
                renderServiceChart(serviceNames, avgRatings, positiveCount, negativeCount);
            })
            .catch(error => {
                console.error('Error:', error);
                // Display user-friendly error
                const tableBody = document.getElementById('serviceAnalyticsTable');
                tableBody.innerHTML = '<tr><td colspan="4">Failed to load analytics data. Please check your login status.</td></tr>';
            });
    }
    
    function renderProductChart(labels, ratings, positive, negative) {
        const container = document.getElementById('productChartContainer');
        // Clear previous content
        container.innerHTML = '';
        
        // Set optimal dimensions for laptop displays
        container.style.height = '500px'; // Taller height for better visibility on laptops
        container.style.maxWidth = '1200px'; // Limit width to prevent excessive stretching
        container.style.margin = '0 auto'; // Center the chart
        
        const ctx = document.createElement('canvas');
        container.appendChild(ctx);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Average Rating',
                        data: ratings,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Positive Feedbacks',
                        data: positive,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Negative Feedbacks',
                        data: negative,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Prevents distortion on resize
                devicePixelRatio: 1.5, // Sharper rendering on laptop screens
                scales: {
                    x: {
                        offset: true, // Better alignment with labels
                        ticks: {
                            font: {
                                size: 14 // Larger font for better readability on laptops
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Feedback Count',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            precision: 0 // Show only whole numbers for count
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        max: 5,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Rating',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            stepSize: 1 // Show whole number increments for ratings
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14 // Better readability on laptops
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            size: 14
                        },
                        padding: 12
                    }
                },
                // Better spacing for bar groups
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        });
    }
    
    function renderServiceChart(labels, ratings, positive, negative) {

        const container = document.getElementById('serviceChartContainer');
        // Clear previous content
        container.innerHTML = '';
        
        // Set optimal dimensions for laptop displays
        container.style.height = '500px'; // Taller height for better visibility on laptops
        container.style.maxWidth = '1200px'; // Limit width to prevent excessive stretching
        container.style.margin = '0 auto'; // Center the chart
        
        const ctx = document.createElement('canvas');
        container.appendChild(ctx);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Average Rating',
                        data: ratings,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Positive Feedbacks',
                        data: positive,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Negative Feedbacks',
                        data: negative,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Prevents distortion on resize
                devicePixelRatio: 1.5, // Sharper rendering on laptop screens
                scales: {
                    x: {
                        offset: true, // Better alignment with labels
                        ticks: {
                            font: {
                                size: 14 // Larger font for better readability on laptops
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Feedback Count',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            precision: 0 // Show only whole numbers for count
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        max: 5,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Rating',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            stepSize: 1 // Show whole number increments for ratings
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14 // Better readability on laptops
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            size: 14
                        },
                        padding: 12
                    }
                },
                // Better spacing for bar groups
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        });
    }
});