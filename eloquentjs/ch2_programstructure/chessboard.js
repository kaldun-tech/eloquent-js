let size = 13;
let even_buffer = '', odd_buffer = '';
// Form two buffers
for (i = 0; i < size; ++i) {
    if (i % 2 == 0) {
        even_buffer += ' ';
        odd_buffer += '#';
    } else {
        even_buffer += '#';
        odd_buffer += ' ';
    }
}
// Print interweaved buffers
for (i = 0; i < size; ++i) {
    console.log(i % 2 == 0 ? even_buffer : odd_buffer);
}
