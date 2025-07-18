const imageUpload = document.getElementById('imageUpload');

const canvas = document.getElementById('imageCanvas');

const ctx = canvas.getContext('2d');

const scanBtn = document.getElementById('scanBtn');

const loader = document.getElementById('loader');

const results = document.getElementById('results');

const darkToggle = document.getElementById('darkModeToggle');



let selectedHex = '';

let img = new Image();



imageUpload.addEventListener('change', function () {

  const file = this.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {

    img.onload = () => {

      canvas.width = img.width;

      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

    };

    img.src = e.target.result;

  };

  reader.readAsDataURL(file);

});



canvas.addEventListener('click', function (e) {

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;

  const y = e.clientY - rect.top;

  const data = ctx.getImageData(x, y, 1, 1).data;

  selectedHex = rgbToHex(data[0], data[1], data[2]);

  const colorDisplay = document.getElementById('colorDisplay');

  colorDisplay.style.backgroundColor = selectedHex;

  colorDisplay.innerText = selectedHex;

});



scanBtn.addEventListener('click', async function () {

  if (!selectedHex) return alert("Click a color first!");

  loader.style.display = 'block';

  results.innerHTML = '';



  const productType = document.getElementById('productType').value;

  const vegan = document.getElementById('veganFilter').checked;

  const cruelty = document.getElementById('crueltyFreeFilter').checked;



  try {

    const res = await fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?product_type=${productType}`);

    const products = await res.json();



    const filtered = products.filter(p => {

      const hexMatch = p.product_colors.some(c => c.hex_value && colorsAreClose(c.hex_value, selectedHex));

      const veganOk = !vegan || p.tag_list.includes("vegan");

      const crueltyOk = !cruelty || p.tag_list.includes("cruelty free");

      return hexMatch && veganOk && crueltyOk;

    });



    if (filtered.length === 0) {

      results.innerHTML = `<p>No matching products found.</p>`;

    } else {

      filtered.slice(0, 10).forEach(p => {

        const div = document.createElement('div');

        div.className = 'product-card';

        div.innerHTML = `

          <img src="${p.image_link}" alt="${p.name}"/>

          <div>

            <strong>${p.brand} - ${p.name}</strong><br>

            Price: ${p.price ? `$${p.price}` : 'N/A'}<br>

            <a href="${p.product_link}" target="_blank">View Product</a>

          </div>

        `;

        results.appendChild(div);

      });

    }

  } catch (e) {

    results.innerHTML = `<p>Error fetching products.</p>`;

  }



  loader.style.display = 'none';

});



function rgbToHex(r, g, b) {

  return "#" + [r, g, b].map(x => {

    const hex = x.toString(16);

    return hex.length === 1 ? "0" + hex : hex;

  }).join("");

}



function colorsAreClose(hex1, hex2) {

  const c1 = hexToRgb(hex1);

  const c2 = hexToRgb(hex2);

  const distance = Math.sqrt(

    Math.pow(c1.r - c2.r, 2) +

    Math.pow(c1.g - c2.g, 2) +

    Math.pow(c1.b - c2.b, 2)

  );

  return distance < 60; // tolerance for match

}



function hexToRgb(hex) {

  hex = hex.replace('#', '');

  const bigint = parseInt(hex, 16);

  return {

    r: (bigint >> 16) & 255,

    g: (bigint >> 8) & 255,

    b: bigint & 255

  };

}



darkToggle.addEventListener('change', () => {

  document.body.classList.toggle('dark-mode');


});

