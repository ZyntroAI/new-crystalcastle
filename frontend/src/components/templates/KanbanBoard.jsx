import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";

export const STATUS_COLUMNS = [
  { id: "draft", label: "Draft" },
  { id: "ready", label: "In Progress" },
  { id: "deployed", label: "Completed" },
];

export default function KanbanBoard({ templates, onStatusChange }) {
  const byStatus = (status) => templates.filter((t) => (t.status || "draft") === status);

  const handleDrop = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const template = templates.find((t) => t.id === draggableId);
    if (!template || (template.status || "draft") === destination.droppableId) return;
    onStatusChange(template, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <div className="grid gap-4 md:grid-cols-3">
        {STATUS_COLUMNS.map((col) => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[240px] rounded-2xl border p-3 transition ${
                  snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-border bg-muted/40"
                }`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {byStatus(col.id).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {byStatus(col.id).map((t, idx) => (
                    <Draggable key={t.id} draggableId={t.id} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={dragProvided.draggableProps.style}
                          className={dragSnapshot.isDragging ? "rounded-xl shadow-lg ring-2 ring-ring/30" : ""}
                        >
                          <KanbanCard template={t} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
