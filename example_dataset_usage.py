"""
Example: Using kagglehub to download and evaluate with the Temporal Tracker
"""

import kagglehub
from temporal_tracker import TemporalTracker
from dataset_evaluator import DatasetEvaluator

# Download latest version using kagglehub
print("Downloading dataset from Kaggle...")
path = kagglehub.dataset_download("starblasters8/human-vs-llm-text-corpus")
print(f"Path to dataset files: {path}")

# Initialize tracker and evaluator
tracker = TemporalTracker()
evaluator = DatasetEvaluator(tracker)

# Load and evaluate
df = evaluator.load_dataset(path)

# Sample 100 texts for quick evaluation
metrics = evaluator.evaluate_on_dataset(df, sample_size=100)

# Display results
evaluator.display_evaluation_results(metrics)

# Save results
evaluator.save_results("evaluation_results.json")
