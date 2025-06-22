// This file contains all the styling extracted from doctor.tsx
// It can be imported and used across different pages for consistent styling

export const dashboardStyles = `
  /* Reset */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Animation classes */
  @keyframes float-slow {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-10px) translateX(10px); }
    50% { transform: translateY(10px) translateX(-10px); }
    75% { transform: translateY(-5px) translateX(-5px); }
  }
  
  @keyframes float-medium {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-15px) translateX(5px); }
    50% { transform: translateY(10px) translateX(10px); }
    75% { transform: translateY(-5px) translateX(-10px); }
  }
  
  @keyframes float-fast {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-20px) translateX(-10px); }
    50% { transform: translateY(15px) translateX(15px); }
    75% { transform: translateY(-10px) translateX(5px); }
  }
  
  .animate-float-slow {
    animation: float-slow 15s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 12s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 10s ease-in-out infinite;
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
  
  /* Borders */
  .rounded-lg {
    border-radius: 0.5rem;
  }
  
  .rounded-md {
    border-radius: 0.375rem;
  }
  
  .rounded-full {
    border-radius: 9999px;
  }
  
  .border {
    border-width: 1px;
  }
  
  .border-t {
    border-top-width: 1px;
  }
  
  .border-b {
    border-bottom-width: 1px;
  }
  
  /* Misc */
  .cursor-pointer {
    cursor: pointer;
  }
  
  .overflow-hidden {
    overflow: hidden;
  }
  
  .w-full {
    width: 100%;
  }
  
  .h-full {
    height: 100%;
  }
  
  .w-6 {
    width: 1.5rem;
  }
  
  .h-6 {
    height: 1.5rem;
  }
  
  .w-5 {
    width: 1.25rem;
  }
  
  .h-5 {
    height: 1.25rem;
  }
  
  .w-4 {
    width: 1rem;
  }
  
  .h-4 {
    height: 1rem;
  }
  
  .w-10 {
    width: 2.5rem;
  }
  
  .h-10 {
    height: 2.5rem;
  }
  
  .w-20 {
    width: 5rem;
  }
  
  .h-20 {
    height: 5rem;
  }
  
  .w-1\/2 {
    width: 50%;
  }
  
  .w-1\/3 {
    width: 33.333333%;
  }
  
  .w-2\/3 {
    width: 66.666667%;
  }
  
  .max-w-md {
    max-width: 28rem;
  }
  
  .max-w-lg {
    max-width: 32rem;
  }
  
  .max-w-xl {
    max-width: 36rem;
  }
  
  .max-w-2xl {
    max-width: 42rem;
  }
  
  .max-w-3xl {
    max-width: 48rem;
  }
  
  .max-w-4xl {
    max-width: 56rem;
  }
  
  .max-w-5xl {
    max-width: 64rem;
  }
  
  .max-w-6xl {
    max-width: 72rem;
  }
  
  .max-w-7xl {
    max-width: 80rem;
  }
  
  /* Form elements */
  input, select, textarea {
    background-color: #292929;
    color: #FFFFFF;
    border: 1px solid #303030;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    font-size: 0.875rem;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #EA2831;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    color: #ABABAB;
  }
  
  button {
    background-color: #EA2831;
    color: #FFFFFF;
    border: none;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #c81f27;
  }
  
  button:disabled {
    background-color: #5a5a5a;
    cursor: not-allowed;
  }
  
  /* Dashboard layout */
  .dashboard {
    display: flex;
    min-height: 100vh;
    background-color: #000000;
    color: #FFFFFF;
  }
  
  .sidebar {
    width: 250px;
    background-color: #212121;
    border-right: 1px solid #292929;
    padding: 1.5rem 1rem;
  }
  
  .main-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .card {
    background-color: #212121;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #292929;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  /* Progress bar */
  .progress-container {
    background-color: #292929;
    border-radius: 9999px;
    height: 0.5rem;
    overflow: hidden;
    margin: 0.5rem 0;
  }
  
  .progress-bar {
    background-color: #EA2831;
    height: 100%;
    border-radius: 9999px;
  }
  
  /* Table styles */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 500;
    color: #ABABAB;
    border-bottom: 1px solid #292929;
  }
  
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #292929;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  /* Badge */
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .badge-red {
    background-color: rgba(234, 40, 49, 0.2);
    color: #EA2831;
  }
  
  .badge-green {
    background-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }
  
  .badge-yellow {
    background-color: rgba(234, 179, 8, 0.2);
    color: #eab308;
  }
  
  .badge-blue {
    background-color: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }
  
  /* Tooltip */
  .tooltip {
    position: relative;
    display: inline-block;
  }
  
  .tooltip-text {
    visibility: hidden;
    background-color: #292929;
    color: #FFFFFF;
    text-align: center;
    border-radius: 0.375rem;
    padding: 0.5rem;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;