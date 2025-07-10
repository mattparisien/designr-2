// Test script to verify shape adding functionality
// This script will simulate clicking on shapes in the sidebar and verify they are added to canvas

console.log('🔧 Testing Shape Adding Functionality');

// Function to test shape addition
function testShapeAddition() {
    console.log('📝 Test: Shape Addition from Sidebar');
    
    // Wait for page to load completely
    setTimeout(() => {
        try {
            // Check if the sidebar is present
            const sidebar = document.querySelector('[data-testid="sidebar"], .sidebar, [class*="sidebar"]');
            console.log('Sidebar found:', !!sidebar);
            
            // Look for shape buttons in the sidebar
            const shapeButtons = document.querySelectorAll('button[title*="Circle"], button[title*="Square"], button[title*="Triangle"]');
            console.log('Shape buttons found:', shapeButtons.length);
            
            // Check for Lucide icons (Circle, Square, Triangle)
            const circleIcon = document.querySelector('svg[data-lucide="circle"]');
            const squareIcon = document.querySelector('svg[data-lucide="square"]');
            const triangleIcon = document.querySelector('svg[data-lucide="triangle"]');
            
            console.log('Circle icon found:', !!circleIcon);
            console.log('Square icon found:', !!squareIcon);
            console.log('Triangle icon found:', !!triangleIcon);
            
            // Check canvas elements before clicking
            const canvasElementsBefore = document.querySelectorAll('[class*="canvas"] [data-element], [data-canvas] > div > div');
            console.log('Canvas elements before click:', canvasElementsBefore.length);
            
            // Try to click on a shape button if found
            if (circleIcon) {
                const clickableParent = circleIcon.closest('button, [role="button"], div[onclick]');
                console.log('Clickable circle parent found:', !!clickableParent);
                
                if (clickableParent) {
                    console.log('🖱️ Clicking circle shape...');
                    clickableParent.click();
                    
                    // Check canvas elements after clicking
                    setTimeout(() => {
                        const canvasElementsAfter = document.querySelectorAll('[class*="canvas"] [data-element], [data-canvas] > div > div');
                        console.log('Canvas elements after click:', canvasElementsAfter.length);
                        
                        if (canvasElementsAfter.length > canvasElementsBefore.length) {
                            console.log('✅ SUCCESS: Shape was added to canvas!');
                        } else {
                            console.log('❌ FAILED: No new elements detected on canvas');
                            
                            // Debug information
                            console.log('Canvas container:', document.querySelector('[data-canvas]'));
                            console.log('Elements container:', document.querySelector('[data-canvas] > div'));
                        }
                    }, 500);
                }
            }
            
            // Check if shapes panel is open
            const shapesPanel = document.querySelector('[data-testid="shapes-panel"], [class*="shapes"]');
            console.log('Shapes panel found:', !!shapesPanel);
            
            // Look for shape icons specifically
            const allIcons = document.querySelectorAll('svg');
            console.log('Total SVG icons found:', allIcons.length);
            
            // Check for click handlers
            const elementsWithClick = document.querySelectorAll('[onclick], button');
            console.log('Elements with click handlers:', elementsWithClick.length);
            
        } catch (error) {
            console.error('❌ Test error:', error);
        }
    }, 2000);
}

// Function to monitor canvas changes
function monitorCanvasChanges() {
    console.log('👀 Setting up canvas change monitor...');
    
    const canvas = document.querySelector('[data-canvas]');
    if (canvas) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    console.log('🔄 Canvas DOM change detected:', mutation.addedNodes.length, 'nodes added');
                }
            });
        });
        
        observer.observe(canvas, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Canvas monitor set up successfully');
    } else {
        console.log('❌ Canvas element not found for monitoring');
    }
}

// Run the tests
if (typeof window !== 'undefined') {
    testShapeAddition();
    monitorCanvasChanges();
} else {
    console.log('This script should be run in a browser environment');
}
