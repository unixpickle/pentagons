"""
Generate points for a dodecahedron by solving an
optimization problem.

Gradient descent doesn't always converge to the global
minimum, so I run it repeatedly and keep printing the
solutions it comes up with if they're better than the
previous solution.
"""

import math

import torch
import torch.nn as nn
import torch.optim as optim


def dist_loss(v1, v2):
    return torch.pow(torch.norm(v1 - v2, dim=0) - 1, 2)


def skip_dist_loss(v1, v2):
    radius = 0.5 / math.sin(math.pi / 5)
    x = radius * math.cos(4 * math.pi / 5)
    y = radius * math.sin(4 * math.pi / 5)
    target = math.sqrt(math.pow(x - radius, 2) + math.pow(y, 2))
    return torch.pow(torch.norm(v1 - v2) - target, 2)


def pent_loss(all_vertices, indices):
    vecs = [all_vertices[i] for i in indices]
    losses = [dist_loss(vecs[(i + 1) % 5], vecs[i]) for i in range(5)]
    skip_losses = [skip_dist_loss(vecs[(i + 2) % 5], vecs[i]) for i in range(5)]
    return torch.sum(torch.stack(losses + skip_losses))


def optimize(vertices, steps, lr=5e-2):
    adam = optim.Adam([vertices], lr=lr)
    for i in range(steps):
        adam.zero_grad()
        center_loss = torch.norm(torch.mean(vertices, dim=0))
        pent_losses = [pent_loss(vertices, inds) for inds in pentagons]
        loss = center_loss + torch.sum(torch.stack(pent_losses))
        loss.backward()
        adam.step()


def best_init():
    best_verts = None
    best_loss = 1000000
    for _ in range(10):
        norm = torch.randn(()) * 1.5
        vertices = torch.randn(20, 3)
        vertices -= torch.sum(vertices, dim=0)
        vertices *= norm / torch.norm(vertices, dim=-1, keepdim=True)
        vert_param = nn.Parameter(vertices)
        optimize(vert_param, 50, lr=0.3)
        pent_losses = [pent_loss(vert_param, inds) for inds in pentagons]
        loss = torch.sum(torch.stack(pent_losses)).item()
        if best_verts is None or loss < best_loss:
            best_loss = loss
            best_verts = vert_param
    return best_verts


pentagons = [
    [0, 1, 2, 3, 4],
    [4, 3, 5, 14, 13],
    [3, 2, 7, 6, 5],
    [2, 1, 9, 8, 7],
    [1, 0, 11, 10, 9],
    [0, 4, 13, 12, 11],
    [8, 9, 10, 16, 15],
    [10, 11, 12, 17, 16],
    [12, 13, 14, 18, 17],
    [14, 5, 6, 19, 18],
    [6, 7, 8, 15, 19],
    [15, 16, 17, 18, 19],
]

best_loss = 1000

while True:
    vertices = best_init()
    adam = optim.Adam([vertices], lr=0.02)
    last_loss = None
    for i in range(10000):
        adam.zero_grad()
        center_loss = torch.norm(torch.mean(vertices, dim=0))
        pent_losses = [pent_loss(vertices, inds) for inds in pentagons]
        loss = center_loss + torch.sum(torch.stack(pent_losses))
        loss.backward()
        adam.step()
        if i == 0:
            last_loss = loss.item()
        elif i % 100 == 0:
            if last_loss < loss.item():
                break
            last_loss = loss.item()
    loss = loss.item()
    print('loss: %f' % loss)
    if loss < best_loss:
        best_loss = loss
        arr = vertices.detach().numpy()
        print('\n'.join('new THREE.Vector3(%f, %f, %f),' % (v[0], v[1], v[2]) for v in arr))
