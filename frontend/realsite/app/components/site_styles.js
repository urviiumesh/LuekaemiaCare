// This file contains all the styling extracted from doctor.tsx
// It can be imported and used across different pages for consistent styling

export const dashboardStyles = `
  /* Reset */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Dashboard specific styles */
  .bg-black {
    background-color: #000000;
  }
  
  .text-\\[\\#FFFFFF\\] {
    color: #FFFFFF;
  }
  
  .text-\\[\\#ABABAB\\] {
    color: #ABABAB;
  }
  
  .bg-\\[\\#212121\\] {
    background-color: #212121;
  }
  
  .bg-\\[\\#292929\\] {
    background-color: #292929;
  }
  
  .bg-\\[\\#EA2831\\] {
    background-color: #EA2831;
  }
  
  .border-\\[\\#292929\\] {
    border-color: #292929;
  }
  
  .border-\\[\\#303030\\] {
    border-color: #303030;
  }
  
  .border-t-\\[\\#303030\\] {
    border-top-color: #303030;
  }
  
  .border-b-\\[\\#292929\\] {
    border-bottom-color: #292929;
  }
  
  /* Layout */
  .flex {
    display: flex;
  }
  
  .flex-col {
    flex-direction: column;
  }
  
  .flex-1 {
    flex: 1;
  }
  
  .flex-wrap {
    flex-wrap: wrap;
  }
  
  .items-center {
    align-items: center;
  }
  
  .justify-between {
    justify-content: space-between;
  }
  
  .justify-center {
    justify-content: center;
  }
  
  .gap-1 {
    gap: 0.25rem;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
  
  .gap-3 {
    gap: 0.75rem;
  }
  
  .gap-4 {
    gap: 1rem;
  }
  
  .gap-8 {
    gap: 2rem;
  }
  
  .p-4 {
    padding: 1rem;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .px-10 {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
  
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-5 {
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }
  
  .p-6 {
    padding: 1.5rem;
  }
  
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  
  .mb-3 {
    margin-bottom: 0.75rem;
  }
  
  .ml-3 {
    margin-left: 0.75rem;
  }
  
  .mt-4 {
    margin-top: 1rem;
  }
  
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Typography */
  .text-lg {
    font-size: 1.125rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
  }
  
  .text-base {
    font-size: 1rem;
  }
  
  .text-4xl {
    font-size: 2.25rem;
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .text-xl {
    font-size: 1.25rem;
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .font-medium {
    font-weight: 500;
  }
  
  .font-normal {
    font-weight: 400;
  }
  
  .font-black {
    font-weight: 900;
  }
  
  .leading-tight {
    line-height: 1.25;
  }
  
  .leading-normal {
    line-height: 1.5;
  }
  
  .tracking-\\[-0.015em\\] {
    letter-spacing: -0.015em;
  }
  
  .tracking-\\[-0.033em\\] {
    letter-spacing: -0.033em;
  }
  
  /* Borders */
  .border {
    border-width: 1px;
    border-style: solid;
  }
  
  .border-t {
    border-top-width: 1px;
    border-top-style: solid;
  }
  
  .border-b {
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }
  
  .rounded-xl {
    border-radius: 0.75rem;
  }
  
  .rounded-full {
    border-radius: 9999px;
  }
  
  /* Sizing */
  .size-4 {
    width: 1rem;
    height: 1rem;
  }
  
  .size-10 {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .size-full {
    width: 100%;
    height: 100%;
  }
  
  .h-full {
    height: 100%;
  }
  
  .h-10 {
    height: 2.5rem;
  }
  
  .h-8 {
    height: 2rem;
  }
  
  .h-14 {
    height: 3.5rem;
  }
  
  .h-2 {
    height: 0.5rem;
  }
  
  .h-\\[72px\\] {
    height: 72px;
  }
  
  .w-full {
    width: 100%;
  }
  
  .w-fit {
    width: fit-content;
  }
  
  .w-80 {
    width: 20rem;
  }
  
  .w-\\[400px\\] {
    width: 400px;
  }
  
  .min-w-\\[84px\\] {
    min-width: 84px;
  }
  
  .min-w-\\[158px\\] {
    min-width: 158px;
  }
  
  .min-w-40 {
    min-width: 10rem;
  }
  
  .min-w-72 {
    min-width: 18rem;
  }
  
  .min-w-0 {
    min-width: 0;
  }
  
  .min-w-\\[250px\\] {
    min-width: 250px;
  }
  
  .min-w-\\[300px\\] {
    min-width: 300px;
  }
  
  .max-w-\\[480px\\] {
    max-width: 480px;
  }
  
  .max-w-\\[960px\\] {
    max-width: 960px;
  }
  
  .min-h-screen {
    min-height: 100vh;
  }
  
  .min-h-\\[700px\\] {
    min-height: 700px;
  }
  
  /* Backgrounds */
  .bg-cover {
    background-size: cover;
  }
  
  .bg-center {
    background-position: center;
  }
  
  .bg-no-repeat {
    background-repeat: no-repeat;
  }
  
  /* Misc */
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .overflow-hidden {
    overflow: hidden;
  }
  
  .overflow-x-hidden {
    overflow-x: hidden;
  }
  
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .whitespace-nowrap {
    white-space: nowrap;
  }
  
  .cursor-pointer {
    cursor: pointer;
  }
  
  .disabled\\:opacity-50:disabled {
    opacity: 0.5;
  }
  
  .disabled\\:cursor-not-allowed:disabled {
    cursor: not-allowed;
  }
  
  /* Table styles */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th {
    text-align: left;
  }
  
  /* Form elements */
  input, select {
    width: 100%;
    padding: 15px;
    border-radius: 0.75rem;
    background-color: #212121;
    border: 1px solid #303030;
    color: #FFFFFF;
  }
  
  input::placeholder, select::placeholder {
    color: #ABABAB;
  }
  
  select {
    appearance: auto;
  }
  
  /* Grid */
  .grid {
    display: grid;
  }
  
  .grid-cols-\\[20\\%_1fr\\] {
    grid-template-columns: 20% 1fr;
  }
  
  .grid-cols-subgrid {
    grid-template-columns: subgrid;
  }
  
  .col-span-2 {
    grid-column: span 2;
  }
  
  /* Hidden */
  .hidden {
    display: none;
  }
  
  /* Results styling */
  .ethical {
    color: #27ae60;
    font-weight: bold;
  }
  
  .non-ethical {
    color: #e74c3c;
    font-weight: bold;
  }
  
  .effective {
    color: #27ae60;
    font-weight: bold;
  }
  
  .ineffective {
    color: #e74c3c;
    font-weight: bold;
  }
  
  .loading {
    text-align: center;
  }
  
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;