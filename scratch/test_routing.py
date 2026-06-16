from services.ollama_router import route_task
import os

print("--- Running Test 2A ---")
result_a = route_task("coding", "Write one Python line that prints hello world")
print("Coding result:", result_a)

print("\n--- Running Test 2B ---")
result_b = route_task("fast", "Say OK in 3 words or less")
print("Fast result:", result_b)
